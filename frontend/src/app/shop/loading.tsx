export default function ShopLoading() {
    // Generate 8 skeleton cards for standard shop grid
    const skeletons = Array.from({ length: 8 });

    return (
        <div className="min-h-screen pt-12 pb-24">
            <div className="max-w-[1920px] mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-baseline mb-8">
                    <div className="h-10 w-48 bg-secondary/10 animate-pulse hidden md:block" />
                    <div className="h-4 w-24 bg-secondary/10 animate-pulse mt-4 md:mt-0" />
                </div>

                <div className="mb-12 h-16 w-full bg-secondary/10 animate-pulse" /> {/* Filter Bar Skeleton */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
                    {skeletons.map((_, i) => (
                        <div key={i} className="group block animate-pulse">
                            <div className="relative aspect-[3/4] bg-secondary/10 mb-6" />
                            <div className="flex flex-col px-2">
                                <div className="h-2 w-16 bg-secondary/10 mb-3" />
                                <div className="flex justify-between gap-2">
                                    <div className="h-4 w-3/4 bg-secondary/10" />
                                    <div className="h-4 w-1/4 bg-secondary/10" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
