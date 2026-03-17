'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchMagazine } from '@/lib/api';

interface Magazine {
    id: number;
    title: string;
    slug: string;
    thumbnail: string;
}

const ARTICLE_CONTENT: Record<string, React.ReactNode> = {
    'art-of-suffering': (
        <>
            <p>Suffering is usually treated as something to escape. A flaw in the system. A phase to rush through. But across every discipline that compounds over time — art, business, fitness, craft, movement — suffering is not an error. It is the medium.</p>
            <p>The difference between people who create enduring work and those who burn out chasing momentum is not talent, access, or intelligence. It is their relationship with discomfort. Some see suffering as proof they are misaligned. Others recognize it as proof they are early.</p>
            <p>In creative work, suffering looks like obscurity. Producing work with no immediate applause. Sitting with ideas that refuse to resolve themselves quickly. The temptation is always to abandon depth for visibility — to trade tension for trends. But meaningful work requires friction. Without resistance, nothing sharpens.</p>
            <p>In business, suffering wears a different uniform. Delayed gratification. Boring consistency. Choosing long-term positioning over short-term noise. Most people don’t fail because they lack ideas — they fail because they cannot tolerate the unglamorous middle where nothing looks successful yet.</p>
            <p>The body understands this better than the mind. In fitness, growth only happens through controlled stress. Muscle doesn’t develop from comfort; it adapts to pressure. The pain isn’t the goal — adaptation is. Avoiding discomfort doesn’t preserve strength; it guarantees stagnation.</p>
            <p>Dancers know this instinctively. Repetition. Fatigue. Precision under strain. Mastery is built in moments where quitting would be rational but stopping would be dishonest. The art emerges not from ease, but from staying present inside difficulty.</p>
            <p>Suffering, when chosen deliberately, becomes a form of intelligence. It teaches pacing. It clarifies intent. It strips away performative ambition and exposes what you actually care enough to endure.</p>
            <p>There is a quiet discipline in learning to suffer well. Not dramatically. Not publicly. But patiently. The kind of suffering that doesn’t ask to be seen, only respected. The kind that compounds into taste, strength, clarity, and authority.</p>
            <p>This is not an argument for misery. It is an argument for meaningful resistance — the kind that refines rather than breaks. The kind that turns process into identity.</p>
            <p className="font-bold text-primary">The art is not in suffering itself.<br />The art is in what you become by staying.</p>
        </>
    ),
    'discipline-as-form': (
        <>
            <p>Discipline is often framed as restriction. A set of rules imposed to control behavior. But in practice, discipline functions more like architecture — it doesn't limit expression, it creates the conditions for it.</p>
            <p>Consider the grid system in design. It doesn't stifle creativity; it organizes chaos into legibility. The constraint becomes the structure that allows complexity to breathe. Without it, everything collapses into noise.</p>
            <p>In music, discipline shows up as rhythm. The beat doesn't trap the melody — it gives it a foundation to deviate from. Jazz musicians understand this instinctively. Freedom without structure is just randomness. Improvisation requires a framework to push against.</p>
            <p>The same logic applies to physical training. A disciplined routine isn't about rigidity; it's about creating a baseline that allows you to recognize progress. Without consistency, there's no reference point. Without repetition, there's no refinement.</p>
            <p>In business, discipline manifests as focus. Not doing everything, but doing the right things repeatedly until they compound. Most ventures fail not from lack of ideas, but from lack of commitment to a single direction long enough for it to matter.</p>
            <p>Discipline is also an aesthetic choice. It signals intentionality. A disciplined wardrobe, a disciplined workspace, a disciplined creative process — these aren't about minimalism for its own sake. They're about removing friction between thought and execution.</p>
            <p>There's a difference between discipline and control. Control is external — someone else's rules applied to your behavior. Discipline is internal — a structure you choose because it serves your intent. One feels like confinement. The other feels like clarity.</p>
            <p className="font-bold text-primary">Discipline is not the absence of freedom.<br />It is the architecture that makes freedom legible.</p>
        </>
    ),
    'emptiness-of-hype': (
        <>
            <p>Most of what gets labeled &ldquo;culture&rdquo; today is just coordinated attention. A product drops. Everyone posts about it. Two weeks later, it&rsquo;s forgotten. This cycle repeats endlessly, and somewhere in the churn, we&rsquo;re supposed to believe something meaningful is happening.</p>
            <p>But hype is not culture. Hype is the performance of culture — a simulation designed to generate momentum without requiring substance. It thrives on urgency, scarcity, and FOMO. It collapses the moment the next thing arrives.</p>
            <p>Real culture compounds. It builds context over time. It references itself, evolves, and creates a shared language that deepens with use. Hype, by contrast, is disposable by design. It&rsquo;s engineered for virality, not longevity. It optimizes for the spike, not the sustain.</p>
            <p>The problem isn&rsquo;t that hype exists — it&rsquo;s that it&rsquo;s mistaken for the real thing. A brand collaborates with an artist, drops a limited capsule, and calls it a cultural moment. But if nothing changes after the product sells out, it wasn&rsquo;t culture. It was just commerce with better marketing.</p>
            <p className="font-bold text-primary">If it disappears the moment you stop talking about it,<br />it was never culture. It was just noise.</p>
        </>
    ),
    'working-body': (
        <>
            <p>The body is not a project. It's not something to optimize, hack, or perfect. It's a tool — a working instrument that either serves your intent or limits it. The question isn't whether your body is ideal. The question is whether it's functional.</p>
            <p>Fitness culture has turned the body into an aesthetic object. Something to display, photograph, and validate through external approval. But this misses the point entirely. The body's value isn't in how it looks. It's in what it allows you to do.</p>
            <p>A dancer doesn't train for aesthetics. They train for control, endurance, and precision. The body becomes an extension of thought — responsive, reliable, and capable of executing complex sequences without hesitation. The form follows function, not the other way around.</p>
            <p className="font-bold text-primary">The body is not a temple.<br />It's a workshop. Treat it accordingly.</p>
        </>
    ),
    'the-working-body': (
        <>
            <p>The body is not a project. It's not something to optimize, hack, or perfect. It's a tool — a working instrument that either serves your intent or limits it. The question isn't whether your body is ideal. The question is whether it's functional.</p>
            <p>Fitness culture has turned the body into an aesthetic object. Something to display, photograph, and validate through external approval. But this misses the point entirely. The body's value isn't in how it looks. It's in what it allows you to do.</p>
            <p>A dancer doesn't train for aesthetics. They train for control, endurance, and precision. The body becomes an extension of thought — responsive, reliable, and capable of executing complex sequences without hesitation. The form follows function, not the other way around.</p>
            <p className="font-bold text-primary">The body is not a temple.<br />It's a workshop. Treat it accordingly.</p>
        </>
    )
};

export default function MagazineDetailPage() {
    const { slug } = useParams();
    const [magazine, setMagazine] = useState<Magazine | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        async function loadMagazine() {
            try {
                const data = await fetchMagazine(slug as string);
                setMagazine(data);
            } catch (error) {
                console.error("Failed to fetch magazine:", error);
            } finally {
                setLoading(false);
            }
        }
        loadMagazine();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-32 px-6 animate-pulse">
                <div className="max-w-3xl mx-auto">
                    <div className="h-8 bg-secondary/10 w-1/4 mb-12"></div>
                    <div className="h-24 bg-secondary/10 w-3/4 mb-12"></div>
                    <div className="aspect-video bg-secondary/10 mb-16"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-secondary/10 w-full"></div>
                        <div className="h-4 bg-secondary/10 w-full"></div>
                        <div className="h-4 bg-secondary/10 w-2/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!magazine) {
        return (
            <div className="min-h-screen bg-background pt-32 px-6 flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
                <Link href="/magazine" className="text-primary underline">Back to Magazine</Link>
            </div>
        );
    }

    const content = ARTICLE_CONTENT[slug as string] || (
        <div className="space-y-8 text-lg md:text-xl text-secondary leading-relaxed">
            <p>
                The depth of editorial content for {magazine.title} is currently being curated. 
                Our magazine focuses on the intersection of craft, discipline, and the architectural 
                evolution of the human form.
            </p>
            <p>
                In every volume, we explore how discipline creates the conditions for expression, 
                and how meaningful resistance refines the intent of the creator.
            </p>
            <p className="font-bold text-primary">
                The architecture of intent is built in the details.
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pt-32 pb-24 px-6 md:px-12">
            <header className="max-w-3xl mx-auto mb-12">
                <div className="flex justify-between items-end mb-8 border-b border-border/50 pb-4">
                    <Link href="/magazine" className="text-sm font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors">
                        ← Back to Magazine
                    </Link>
                    <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                        Volume 01 • Philosophy
                    </span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-none mb-8">
                    {magazine.title}.
                </h1>
            </header>

            <main className="max-w-3xl mx-auto">
                <div className="aspect-[16/9] relative mb-16 bg-secondary/10">
                    <Image
                        src={magazine.thumbnail || "/new_image/art_of_suffering.jpg"}
                        alt={magazine.title}
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                <div className="prose prose-lg prose-invert max-w-none">
                    <div className="space-y-8 text-lg md:text-xl text-secondary leading-relaxed">
                        {content}
                    </div>
                </div>
            </main>
        </div>
    );
}
