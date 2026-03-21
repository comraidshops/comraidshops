import os
from django.core.management.base import BaseCommand
from core.models import Magazine, Article

ARTICLE_CONTENT = {
    'art-of-suffering': (
        "<p>Suffering is usually treated as something to escape. A flaw in the system. A phase to rush through. But across every discipline that compounds over time — art, business, fitness, craft, movement — suffering is not an error. It is the medium.</p>\n"
        "<p>The difference between people who create enduring work and those who burn out chasing momentum is not talent, access, or intelligence. It is their relationship with discomfort. Some see suffering as proof they are misaligned. Others recognize it as proof they are early.</p>\n"
        "<p>In creative work, suffering looks like obscurity. Producing work with no immediate applause. Sitting with ideas that refuse to resolve themselves quickly. The temptation is always to abandon depth for visibility — to trade tension for trends. But meaningful work requires friction. Without resistance, nothing sharpens.</p>\n"
        "<p>In business, suffering wears a different uniform. Delayed gratification. Boring consistency. Choosing long-term positioning over short-term noise. Most people don’t fail because they lack ideas — they fail because they cannot tolerate the unglamorous middle where nothing looks successful yet.</p>\n"
        "<p>The body understands this better than the mind. In fitness, growth only happens through controlled stress. Muscle doesn’t develop from comfort; it adapts to pressure. The pain isn’t the goal — adaptation is. Avoiding discomfort doesn’t preserve strength; it guarantees stagnation.</p>\n"
        "<p>Dancers know this instinctively. Repetition. Fatigue. Precision under strain. Mastery is built in moments where quitting would be rational but stopping would be dishonest. The art emerges not from ease, but from staying present inside difficulty.</p>\n"
        "<p>Suffering, when chosen deliberately, becomes a form of intelligence. It teaches pacing. It clarifies intent. It strips away performative ambition and exposes what you actually care enough to endure.</p>\n"
        "<p>There is a quiet discipline in learning to suffer well. Not dramatically. Not publicly. But patiently. The kind of suffering that doesn’t ask to be seen, only respected. The kind that compounds into taste, strength, clarity, and authority.</p>\n"
        "<p>This is not an argument for misery. It is an argument for meaningful resistance — the kind that refines rather than breaks. The kind that turns process into identity.</p>\n"
        "<p class=\"font-bold text-primary\">The art is not in suffering itself.<br />The art is in what you become by staying.</p>"
    ),
    'discipline-as-form': (
        "<p>Discipline is often framed as restriction. A set of rules imposed to control behavior. But in practice, discipline functions more like architecture — it doesn't limit expression, it creates the conditions for it.</p>\n"
        "<p>Consider the grid system in design. It doesn't stifle creativity; it organizes chaos into legibility. The constraint becomes the structure that allows complexity to breathe. Without it, everything collapses into noise.</p>\n"
        "<p>In music, discipline shows up as rhythm. The beat doesn't trap the melody — it gives it a foundation to deviate from. Jazz musicians understand this instinctively. Freedom without structure is just randomness. Improvisation requires a framework to push against.</p>\n"
        "<p>The same logic applies to physical training. A disciplined routine isn't about rigidity; it's about creating a baseline that allows you to recognize progress. Without consistency, there's no reference point. Without repetition, there's no refinement.</p>\n"
        "<p>In business, discipline manifests as focus. Not doing everything, but doing the right things repeatedly until they compound. Most ventures fail not from lack of ideas, but from lack of commitment to a single direction long enough for it to matter.</p>\n"
        "<p>Discipline is also an aesthetic choice. It signals intentionality. A disciplined wardrobe, a disciplined workspace, a disciplined creative process — these aren't about minimalism for its own sake. They're about removing friction between thought and execution.</p>\n"
        "<p>There's a difference between discipline and control. Control is external — someone else's rules applied to your behavior. Discipline is internal — a structure you choose because it serves your intent. One feels like confinement. The other feels like clarity.</p>\n"
        "<p class=\"font-bold text-primary\">Discipline is not the absence of freedom.<br />It is the architecture that makes freedom legible.</p>"
    ),
    'emptiness-of-hype': (
        "<p>Most of what gets labeled “culture” today is just coordinated attention. A product drops. Everyone posts about it. Two weeks later, it’s forgotten. This cycle repeats endlessly, and somewhere in the churn, we’re supposed to believe something meaningful is happening.</p>\n"
        "<p>But hype is not culture. Hype is the performance of culture — a simulation designed to generate momentum without requiring substance. It thrives on urgency, scarcity, and FOMO. It collapses the moment the next thing arrives.</p>\n"
        "<p>Real culture compounds. It builds context over time. It references itself, evolves, and creates a shared language that deepens with use. Hype, by contrast, is disposable by design. It’s engineered for virality, not longevity. It optimizes for the spike, not the sustain.</p>\n"
        "<p>The problem isn’t that hype exists — it’s that it’s mistaken for the real thing. A brand collaborates with an artist, drops a limited capsule, and calls it a cultural moment. But if nothing changes after the product sells out, it wasn’t culture. It was just commerce with better marketing.</p>\n"
        "<p class=\"font-bold text-primary\">If it disappears the moment you stop talking about it,<br />it was never culture. It was just noise.</p>"
    ),
    'working-body': (
        "<p>The body is not a project. It's not something to optimize, hack, or perfect. It's a tool — a working instrument that either serves your intent or limits it. The question isn't whether your body is ideal. The question is whether it's functional.</p>\n"
        "<p>Fitness culture has turned the body into an aesthetic object. Something to display, photograph, and validate through external approval. But this misses the point entirely. The body's value isn't in how it looks. It's in what it allows you to do.</p>\n"
        "<p>A dancer doesn't train for aesthetics. They train for control, endurance, and precision. The body becomes an extension of thought — responsive, reliable, and capable of executing complex sequences without hesitation. The form follows function, not the other way around.</p>\n"
        "<p class=\"font-bold text-primary\">The body is not a temple.<br />It's a workshop. Treat it accordingly.</p>"
    ),
    'the-working-body': (
        "<p>The body is not a project. It's not something to optimize, hack, or perfect. It's a tool — a working instrument that either serves your intent or limits it. The question isn't whether your body is ideal. The question is whether it's functional.</p>\n"
        "<p>Fitness culture has turned the body into an aesthetic object. Something to display, photograph, and validate through external approval. But this misses the point entirely. The body's value isn't in how it looks. It's in what it allows you to do.</p>\n"
        "<p>A dancer doesn't train for aesthetics. They train for control, endurance, and precision. The body becomes an extension of thought — responsive, reliable, and capable of executing complex sequences without hesitation. The form follows function, not the other way around.</p>\n"
        "<p class=\"font-bold text-primary\">The body is not a temple.<br />It's a workshop. Treat it accordingly.</p>"
    )
}

DEFAULT_EXCERPT_FEATURED = "Explore the intersection of philosophy and discipline through our editorial lens."
DEFAULT_EXCERPT_NORMAL = "Dive deeper into the architectural precision of form and function."

class Command(BaseCommand):
    help = "Populates Article db with hardcoded frontend strings and sets excerpts"

    def handle(self, *args, **options):
        magazines = Magazine.objects.all()
        self.stdout.write(f"Found {magazines.count()} magazines...")
        
        for idx, mag in enumerate(magazines):
            # 1. Update excerpt
            if not mag.excerpt:
                # If it's the first one returned or featured = True
                if mag.is_featured or idx == 0:
                    mag.excerpt = DEFAULT_EXCERPT_FEATURED
                else:
                    mag.excerpt = DEFAULT_EXCERPT_NORMAL
                mag.save()
            
            # 2. Add Article linked content
            content = ARTICLE_CONTENT.get(mag.slug)
            if not content:
                content = (
                    f"<p>The depth of editorial content for {mag.title} is currently being curated. "
                    "Our magazine focuses on the intersection of craft, discipline, and the architectural "
                    "evolution of the human form.</p>\n"
                    "<p>In every volume, we explore how discipline creates the conditions for expression, "
                    "and how meaningful resistance refines the intent of the creator.</p>\n"
                    "<p class=\"font-bold text-primary\">The architecture of intent is built in the details.</p>"
                )
                self.stdout.write(f"Using default content for {mag.slug}")
                
            article, created = Article.objects.get_or_create(magazine=mag)
            article.content = content
            article.save()
            
            self.stdout.write(self.style.SUCCESS(f"Processed article for magazine: {mag.title}"))

        self.stdout.write(self.style.SUCCESS('Successfully populated articles!'))
