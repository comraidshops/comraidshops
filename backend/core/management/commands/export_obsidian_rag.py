import os
import re
from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import models
from django.conf import settings

class Command(BaseCommand):
    help = 'Exports the database schema and public data into an Obsidian-compatible Markdown vault for RAG'

    def handle(self, *args, **options):
        # Configuration
        base_dir = getattr(settings, 'BASE_DIR', os.getcwd())
        # Go up one level from backend to root, then into obsidian_rag_vault
        # Assuming BASE_DIR is backend
        project_root = os.path.dirname(base_dir) 
        vault_dir = os.path.join(project_root, 'obsidian_rag_vault')
        schema_dir = os.path.join(vault_dir, 'Schema')
        data_dir = os.path.join(vault_dir, 'Data')

        # Ensure directories exist
        os.makedirs(schema_dir, exist_ok=True)
        os.makedirs(data_dir, exist_ok=True)

        self.stdout.write(self.style.SUCCESS(f"Exporting to Obsidian Vault at: {vault_dir}"))

        # Define which apps to introspect for Schema
        APPS_TO_EXPORT = ['core', 'investors']
        
        # Define which models to export Actual Data for
        SAFE_MODELS_FOR_DATA = [
            'core.Category',
            'core.Brand',
            'core.Collection',
            'core.Product',
            'core.Magazine',
            'core.Article',
            'core.Exhibition',
        ]

        self.export_schema(schema_dir, APPS_TO_EXPORT)
        self.export_data(data_dir, SAFE_MODELS_FOR_DATA)
        
        self.stdout.write(self.style.SUCCESS("Export complete! You can now open this folder as an Obsidian vault."))

    def sanitize_filename(self, filename):
        # Remove characters that are unsafe for filenames
        s = str(filename).replace(':', '-').replace('/', '-').replace('\\', '-')
        return re.sub(r'[<>:"/\\|?*]', '', s)[:200]

    def get_obsidian_link(self, obj):
        if obj is None:
            return ""
        model_name = obj.__class__.__name__
        obj_name = str(obj)
        safe_name = self.sanitize_filename(obj_name)
        return f"[[{model_name} - {safe_name}]]"

    def export_schema(self, schema_dir, apps_to_export):
        self.stdout.write("Exporting Schema...")
        
        for app_label in apps_to_export:
            try:
                app_config = apps.get_app_config(app_label)
            except LookupError:
                continue
                
            for model in app_config.get_models():
                model_name = model.__name__
                file_path = os.path.join(schema_dir, f"{model_name}.md")
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    # YAML Frontmatter
                    f.write("---\n")
                    f.write(f"type: schema\n")
                    f.write(f"model: {model_name}\n")
                    f.write(f"app: {app_label}\n")
                    f.write("---\n\n")
                    
                    f.write(f"# {model_name}\n\n")
                    if model.__doc__:
                        f.write(f"{model.__doc__.strip()}\n\n")
                        
                    f.write("## Fields\n\n")
                    f.write("| Field Name | Type | Properties | Links To |\n")
                    f.write("|------------|------|------------|----------|\n")
                    
                    for field in model._meta.get_fields():
                        field_name = field.name
                        field_type = field.__class__.__name__
                        properties = []
                        links_to = ""
                        
                        if hasattr(field, 'null') and field.null:
                            properties.append("null")
                        if hasattr(field, 'blank') and field.blank:
                            properties.append("blank")
                        if hasattr(field, 'unique') and field.unique:
                            properties.append("unique")
                            
                        # Handle Relationships
                        if field.is_relation and field.related_model:
                            related_model_name = field.related_model.__name__
                            links_to = f"[[{related_model_name}]]"
                            
                        prop_str = ", ".join(properties) if properties else "-"
                        f.write(f"| {field_name} | `{field_type}` | {prop_str} | {links_to} |\n")

    def export_data(self, data_dir, safe_models):
        self.stdout.write("Exporting Data...")
        
        for model_path in safe_models:
            app_label, model_name = model_path.split('.')
            try:
                model = apps.get_model(app_label, model_name)
            except LookupError:
                self.stdout.write(self.style.WARNING(f"Model {model_path} not found."))
                continue
                
            # Create a subfolder for each model type
            model_dir = os.path.join(data_dir, model_name)
            os.makedirs(model_dir, exist_ok=True)
            
            queryset = model.objects.all()
            for obj in queryset:
                safe_name = self.sanitize_filename(str(obj))
                file_name = f"{model_name} - {safe_name}.md"
                file_path = os.path.join(model_dir, file_name)
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    # Collect basic fields for YAML Frontmatter
                    f.write("---\n")
                    f.write(f"type: data\n")
                    f.write(f"model: {model_name}\n")
                    
                    text_content = ""
                    relations_content = ""
                    
                    for field in model._meta.get_fields():
                        if field.is_relation:
                            # Forward Many-to-One / One-to-One
                            if field.many_to_one or field.one_to_one:
                                try:
                                    related_obj = getattr(obj, field.name)
                                    if related_obj:
                                        relations_content += f"- **{field.name.capitalize()}**: {self.get_obsidian_link(related_obj)}\n"
                                except Exception:
                                    pass
                            
                            # Forward Many-to-Many
                            elif field.many_to_many and not field.auto_created:
                                try:
                                    related_manager = getattr(obj, field.name)
                                    related_objs = related_manager.all()
                                    if related_objs.exists():
                                        relations_content += f"- **{field.name.capitalize()}**:\n"
                                        for r_obj in related_objs:
                                            relations_content += f"  - {self.get_obsidian_link(r_obj)}\n"
                                except Exception:
                                    pass
                        else:
                            # Basic fields
                            try:
                                val = getattr(obj, field.name)
                                if val is not None and val != "":
                                    # Write long text to body, short fields to frontmatter
                                    if isinstance(field, models.TextField) or (isinstance(val, str) and len(val) > 200):
                                        text_content += f"## {field.name.capitalize()}\n{val}\n\n"
                                    else:
                                        # Format for YAML
                                        yaml_val = str(val).replace('"', "'")
                                        f.write(f"{field.name}: \"{yaml_val}\"\n")
                            except Exception:
                                pass
                                
                    f.write("---\n\n")
                    f.write(f"# {model_name}: {safe_name}\n\n")
                    
                    if text_content:
                        f.write(text_content)
                    
                    if relations_content:
                        f.write("## Relationships\n\n")
                        f.write(relations_content)
