import json
import os
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.utils.text import slugify
from core.models import Magazine, Exhibition


class Command(BaseCommand):
    help = "Import Magazine and Exhibition records from content_export.json into the database."

    def handle(self, *args, **options):
        # ── Locate the export file ──────────────────────────────────────────────
        input_path = os.path.join(settings.BASE_DIR, "content_export.json")

        if not os.path.exists(input_path):
            raise CommandError(
                f"Export file not found at: {input_path}\n"
                "Run 'python manage.py export_content' first (or upload the file)."
            )

        self.stdout.write(f"Reading from: {input_path}")

        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # ── Import Magazines ───────────────────────────────────────────────────
        magazine_records = data.get("magazines", [])
        mag_imported = 0
        mag_skipped = 0

        for entry in magazine_records:
            title = entry.get("title", "").strip()
            if not title:
                continue

            if Magazine.objects.filter(title=title).exists():
                self.stdout.write(f"  [SKIP] Magazine already exists: '{title}'")
                mag_skipped += 1
            else:
                slug = entry.get("slug") or slugify(title)
                # Ensure slug uniqueness
                base_slug = slug
                counter = 1
                while Magazine.objects.filter(slug=slug).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1

                Magazine.objects.create(
                    title=title,
                    slug=slug,
                    is_featured=entry.get("is_featured", False),
                )
                self.stdout.write(f"  [OK]   Imported magazine: '{title}'")
                mag_imported += 1

        # ── Import Exhibitions ─────────────────────────────────────────────────
        exhibition_records = data.get("exhibitions", [])
        exh_imported = 0
        exh_skipped = 0

        for entry in exhibition_records:
            title = entry.get("title", "").strip()
            if not title:
                continue

            if Exhibition.objects.filter(title=title).exists():
                self.stdout.write(f"  [SKIP] Exhibition already exists: '{title}'")
                exh_skipped += 1
            else:
                slug = entry.get("slug") or slugify(title)
                base_slug = slug
                counter = 1
                while Exhibition.objects.filter(slug=slug).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1

                Exhibition.objects.create(
                    title=title,
                    slug=slug,
                    is_featured=entry.get("is_featured", False),
                )
                self.stdout.write(f"  [OK]   Imported exhibition: '{title}'")
                exh_imported += 1

        # ── Summary ────────────────────────────────────────────────────────────
        total_skipped = mag_skipped + exh_skipped
        self.stdout.write(
            self.style.SUCCESS(
                f"\n✅ Import complete.\n"
                f"   Imported {mag_imported} magazines\n"
                f"   Imported {exh_imported} exhibitions\n"
                f"   Skipped  {total_skipped} duplicates"
            )
        )
