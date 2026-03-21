import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from core.models import Magazine, Exhibition


class Command(BaseCommand):
    help = "Export Magazine and Exhibition records to content_export.json in the project root."

    def handle(self, *args, **options):
        self.stdout.write("Starting content export...")

        # ── Magazines ──────────────────────────────────────────────────────────
        magazines = list(
            Magazine.objects.values("title", "slug", "is_featured")
        )
        self.stdout.write(f"  Found {len(magazines)} magazine(s).")

        # ── Exhibitions ────────────────────────────────────────────────────────
        exhibitions = list(
            Exhibition.objects.values("title", "slug", "is_featured")
        )
        self.stdout.write(f"  Found {len(exhibitions)} exhibition(s).")

        # ── Build payload ──────────────────────────────────────────────────────
        payload = {
            "magazines": magazines,
            "exhibitions": exhibitions,
        }

        # ── Write file ─────────────────────────────────────────────────────────
        # Save to project root (one level above the app directory)
        project_root = os.path.dirname(settings.BASE_DIR) if hasattr(settings, "BASE_DIR") else os.getcwd()
        # BASE_DIR is typically the "backend/" folder; project root is its parent.
        # We want the file alongside manage.py, so use BASE_DIR directly.
        output_path = os.path.join(settings.BASE_DIR, "content_export.json")

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2, default=str)

        self.stdout.write(
            self.style.SUCCESS(
                f"\n✅ Export complete → {output_path}\n"
                f"   Magazines  : {len(magazines)}\n"
                f"   Exhibitions: {len(exhibitions)}"
            )
        )
