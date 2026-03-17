import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-background border-t border-border py-12 text-xs uppercase tracking-wide">
            <div className="max-w-[1920px] mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-bold mb-4 uppercase">Explore</h3>
                    <div className="flex flex-col gap-2">
                        <Link href="/magazine" className="text-secondary hover:text-primary transition-colors">Magazine</Link>
                        <Link href="/shop" className="text-secondary hover:text-primary transition-colors">Shop</Link>
                        <Link href="/brands" className="text-secondary hover:text-primary transition-colors">Brands</Link>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <h3 className="font-bold mb-2">Support</h3>
                    <Link href="/faq" className="text-secondary hover:text-primary transition-colors">FAQ</Link>
                    <Link href="/shipping" className="text-secondary hover:text-primary transition-colors">Shipping</Link>
                    <Link href="/returns" className="text-secondary hover:text-primary transition-colors">Returns</Link>
                </div>

                <div className="flex flex-col gap-2">
                    <h3 className="font-bold mb-2">Legal</h3>
                    <Link href="/terms" className="text-secondary hover:text-primary transition-colors">Terms of Service</Link>
                    <Link href="/privacy" className="text-secondary hover:text-primary transition-colors">Privacy Policy</Link>
                </div>

                <div>
                    <h3 className="font-bold mb-4">Newsletter</h3>
                    <form className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="bg-transparent border-b border-border focus:border-primary outline-none w-full py-1 placeholder:text-secondary/50"
                        />
                        <button type="submit" className="font-bold hover:text-secondary transition-colors">
                            Join
                        </button>
                    </form>
                </div>
            </div>
            <div className="max-w-[1920px] mx-auto px-4 mt-12 flex justify-between items-center text-secondary/50">
                <p>&copy; {new Date().getFullYear()} ComraidShops. All rights reserved.</p>
                <p>Est. 2026</p>
            </div>
        </footer>
    );
}
