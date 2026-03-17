import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Brand

def populate_va():
    print("Populating cinematic data for VA Verified Anonymous...")

    # Define the luxury editorial content
    description = (
        "VA exists as a testament to the power of identity and the unwavering strength of a singular mindset. "
        "It is more than a label; it is a symbol for a global community built on the bedrock of growth, loyalty, "
        "and collective elevation. We move with an extraordinary purpose, proving that your environment "
        "does not define your future—your mindset does."
    )

    philosophy = (
        "The philosophy of Verified Anonymous is rooted in the belief that authenticity cannot be manufactured. "
        "We fill the void between transient fashion and the eternal bonds of brotherhood. We refuse to compromise, "
        "refusing to chase trends or dilute the purity of our identity. In a world of aesthetics, we choose essence. "
        "Exclusivity is not a barrier, but a vessel for value."
    )

    founder_bio = (
        "Rising from the necessity to prove that a powerful idea can transcend its origin, the founder of VA "
        "built this brand as an extension of a life lived through growth, ambition, and unyielding loyalty. "
        "It represents the transition from the ordinary to the extraordinary, representing thousands who choose "
        "to think bigger, move smarter, and elevate their existence."
    )

    manifesto = (
        "In the coming decade, VA will not be recognized merely as a brand, but as a global cultural movement. "
        "The hoodie was only the beginning—a uniform for the initiated. Our vision expands into an ecosystem of "
        "lifestyle, architecture, and sound, built for impact rather than mere revenue. We are not for everyone; "
        "we are for those who seek distinction through belonging."
    )

    story = (
        "The story of VA is one of cinematic intentionality and intentional silence. Born in the deep charcoals "
        "and off-whites of urban landscapes and industrial geometry, the brand behaves with a calm, observant "
        "confidence. It is a quiet luxury energy that commands respect without shouting, demanding the wearer "
        "to move with purpose and stay loyal to the mission."
    )

    featured_quote = "Environment doesn’t define your future; mindset does."

    # Fetch and update the brand
    try:
        brand = Brand.objects.get(name="VA Verified Anonymous")
        brand.description = description
        brand.philosophy = philosophy
        brand.founder_name = "The Visionary"
        brand.founder_bio = founder_bio
        brand.manifesto = manifesto
        brand.story = story
        brand.featured_quote = featured_quote
        
        # Ensure luxury fields are set
        brand.origin_country = "Germany"
        brand.established_year = 2024
        
        brand.save()
        print(f"Successfully updated brand: {brand.name}")
    except Brand.DoesNotExist:
        print("Error: Brand 'VA Verified Anonymous' not found. Please run the general population script first.")

if __name__ == "__main__":
    populate_va()
