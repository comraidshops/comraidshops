export interface Product {
    id: number;
    name: string;
    price: string;
    description: string;
    image: string;
    vendor: string;
    slug: string;
    category: string;
    stock: number;
    variants: { id: number; name: string; stock: number }[];
    // New Editorial Fields
    narrative?: string;
    usage?: string;
    philosophy?: string;
    features?: { id: number; title: string; description: string; image: string; order: number }[];
    materials?: string;
    fit?: string;
    editorialReference?: string;
    status: string;
    created_at: string;
}

export const PRODUCTS: Product[] = [
    {
        id: 1,
        name: 'Tech Silk 5" Shorts',
        price: "180.00",
        description: 'Lightweight, sweat-wicking running shorts designed for high performance.',
        image: '/new_image/IMG_4330.jpg',
        vendor: 'Dore era',
        slug: 'tech-silk-5-shorts',
        category: 'Bottoms',
        stock: 10,
        variants: [
            { id: 1, name: 'Size: S', stock: 2 },
            { id: 2, name: 'Size: M', stock: 5 },
            { id: 3, name: 'Size: L', stock: 3 },
        ],
        narrative: "The Tech SilkShort is not designed for leisure. It is an instrument of reduction. Removing weight, removing friction, removing distraction. It exists for the state where the runner dissolves into the run.",
        usage: "Engineered for high-output endurance efforts in heat and humidity. The fabric disappears against the skin, managing moisture through mechanical capillary action rather than chemical treatment.",
        philosophy: "Equipment should be silent. If you notice your gear, it has failed. These shorts are designed to be forgotten.",
        features: [
            { id: 1, title: "Zero-Distraction", description: "Bonded seams and internal phone pocket prevent chafing and bounce.", image: '', order: 1 },
            { id: 2, title: "Thermal Regulation", description: "ColdBlack™ technology reduces heat absorption in direct sunlight.", image: '', order: 2 },
            { id: 3, title: "Visibility", description: "Reflective 'Run Away' branding for low-light conditions.", image: '', order: 3 }
        ],
        materials: "Tech Silk™ (Polyamide/Elastane Blend) from Italy. Ultralight (50g), Fast Drying, 4-Way Stretch",
        fit: "Model is 6'1\" wearing size Medium. Performance fit. 5-inch inseam sits mid-thigh. Split hem allows for full range of motion.",
        editorialReference: "Seen in 'The Working Body'",
        status: "approved",
        created_at: "2024-03-01T00:00:00Z"
    },
    {
        id: 2,
        name: 'Auralite T-Shirt',
        price: "95.00",
        description: 'Ultra-lightweight t-shirt with active cooling technology.',
        image: '/new_image/IMG_4330.jpg',
        vendor: 'Dore era',
        slug: 'auralite-t-shirt',
        category: 'Tops',
        stock: 20,
        variants: [
            { id: 4, name: 'Size: S', stock: 5 },
            { id: 5, name: 'Size: M', stock: 10 },
            { id: 6, name: 'Size: L', stock: 5 },
        ],
        narrative: "Auralite™ creates a sensory gap between the body and the environment. It mimics the texture of silk but performs with the rigor of technical mesh.",
        usage: "Ideal for long distances where potential chafing points become critical. The drape is loose to promote airflow.",
        philosophy: "Texture interacts with the mind. A fabric that feels abrasive creates mental friction. Auralite removes that signal.",
        features: [
            { id: 4, title: "Sensory Control", description: "Delta-peak construction creates a prism-like texture that minimizes skin contact.", image: '', order: 1 },
            { id: 5, title: "Active Cooling", description: "Fast-drying fibers prevent saturation during heavy exertion.", image: '', order: 2 }
        ],
        materials: "Auralite™ (100% Polyester) from Japan. Anti-Static, UV Protection, Odor Control",
        fit: "Model is 6'1\" wearing size Medium. Relaxed fit. Boxy cut allowing for maximum airflow.",
        editorialReference: "Featured in 'The Working Body'",
        status: "approved",
        created_at: "2024-03-01T00:00:00Z"
    },
    {
        id: 3,
        name: 'GOCap - Standard',
        price: "45.00",
        description: 'The original soft-brim run cap. Machine washable and packable.',
        image: '/new_image/IMG_4330.jpg',
        vendor: 'Omeiza',
        slug: 'gocap-standard',
        category: 'Accessories',
        stock: 15,
        variants: [
            { id: 7, name: 'One Size', stock: 15 },
        ],
        narrative: "The GOCap redefined the silhouette of running. Before this, hats were rigid, heavy, and corporate. The GOCap introduced the soft brim, the packability, and the democratization of style in endurance sports.",
        usage: "A daily workhorse. Throw it in a bag, wash it in a machine, wear it backwards. It is designed to be abused.",
        philosophy: "Democratic design. Access for everyone. Run everywhere.",
        features: [
            { id: 6, title: "Packable", description: "SOFTcurve brim folds flat without losing shape.", image: '', order: 1 },
            { id: 7, title: "Protection", description: "UPF +40 protection on the brim and front panel.", image: '', order: 2 }
        ],
        materials: "COOLwick™ performance fabric. Machine Washable, Fast Drying, Recycled Performance Fiber",
        fit: "One size fits most. Adjustable back strap. Low profile 5-panel fit.",
        status: "approved",
        created_at: "2024-03-01T00:00:00Z"
    },
    {
        id: 4,
        name: 'Windbreaker Jacket',
        price: "220.00",
        description: 'Water-repellant windbreaker for harsh conditions.',
        image: '/new_image/IMG_4330.jpg',
        vendor: 'Distance',
        slug: 'windbreaker-jacket',
        category: 'Outerwear',
        stock: 5,
        variants: [
            { id: 8, name: 'Size: M', stock: 2 },
            { id: 9, name: 'Size: L', stock: 3 },
        ],
        narrative: "The shell is the final layer of defense. It negotiates with the elements so you don't have to. This windbreaker is stripped of non-essentials to focus entirely on protection-to-weight ratio.",
        usage: "Transitional seasons and alpine starts. Blocks wind completely while shedding light precipitation.",
        philosophy: "Nature is indifferent. Your gear must be opinionated.",
        features: [
            { id: 8, title: "Element Barrier", description: "DWR treated ripstop nylon blocks wind and rain.", image: '', order: 1 },
            { id: 9, title: "Ventilation", description: "Laser-cut back vents allow heat escape without water ingress.", image: '', order: 2 }
        ],
        materials: "Pertex® Quantum (100% Nylon). Windproof, Water Repellant, High Durability",
        fit: "Model is 6'1\" wearing size Large. Athletic fit. Articulated sleeves for running posture.",
        editorialReference: "Seen in 'The Working Body'",
        status: "approved",
        created_at: "2024-03-01T00:00:00Z"
    }
];

export const BRANDS = [
    { id: '1', name: 'Dore era', slug: 'dore-era', description: 'Understated luxury in motion.' },
    { id: '2', name: 'Verified Anonymous', slug: 'verified-anonymous', description: 'Identity is the uniform.' },
    { id: '3', name: 'Omeiza', slug: 'omeiza', description: 'Craft without compromise.' },
    { id: '4', name: 'Distance', slug: 'distance', description: 'Run further.' },
];
