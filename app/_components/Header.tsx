'use client'
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

function Header() {

    const { user } = useUser();

     return (
        <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
            <Link href={'/'}>
                <div className="flex items-center gap-2">
                    <Image src={'/logo.svg'} width={40} height={40} alt="logo"/>
                    <h1 className="text-base font-bold md:text-2xl">Infera</h1>
                </div>
            </Link>
            {/* Toggle Theme */}
           <Link href={'/dashboard'}>
                {
                    user ? (
                        <Button className="hover:cursor-pointer" size={'lg'}>
                            Dashboard
                        </Button>
                    ) : (
                        <Button className="hover:cursor-pointer" size={'lg'}>
                            Login
                        </Button>
                    )
                }
           </Link>
        </nav>
    );
}

export default Header;