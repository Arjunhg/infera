'use client';
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const MenuOptions = [
    {
        name: 'Dashboard',
        path: '/dashboard'
    }
]

function AppHeader() {
    const [isOpen, setIsOpen] = useState<Boolean>(false);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('menu-open');
        } else {
            document.body.classList.remove('menu-open');
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove('menu-open');
        };
    }, [isOpen]);

     return (
        <header className="relative">
            <nav className="flex w-full items-center justify-between border-t border-b border-border px-4 py-4 bg-background">
                <Link href={'/'}>
                    <div className="flex items-center gap-2">
                        <Image src={'/logo.svg'} width={40} height={40} alt="logo" style={{ width: 'auto', height: 'auto' }}/>
                        <h1 className="text-base font-bold md:text-2xl">Infera</h1>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex">
                    <ul className="flex gap-6">
                        {
                            MenuOptions.map((option, i) => (
                                <li key={i} className="text-base font-medium text-muted-foreground hover:text-foreground hover:scale-105 transition-all duration-200 cursor-pointer">
                                    <Link href={option.path}>{option.name}</Link>
                                </li>
                            ))
                        }
                    </ul>
                </div>

                {/* Desktop User Button */}
                <div className="hidden md:flex">
                    <UserButton/>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-2 md:hidden">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setIsOpen(!isOpen)}
                        className="relative z-50"
                        aria-label="Toggle menu"
                    >
                        {
                            isOpen ? <X size={24}/> : <Menu size={24}/>
                        }
                    </Button>
                </div>
            </nav>

            {/* Mobile Dropdown Overlay */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden mobile-menu-backdrop"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Mobile Menu */}
                    <div className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-lg z-50 md:hidden mobile-menu-panel">
                        <div className="p-6">
                            <ul className="flex flex-col gap-2 mb-6">
                                {
                                    MenuOptions.map((option, i) => (
                                        <li key={i} className="mobile-menu-item">
                                            <Link 
                                                href={option.path} 
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center py-3 px-4 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200 group-hover:translate-x-1"
                                            >
                                                {option.name}
                                            </Link>
                                        </li>
                                    ))
                                }
                            </ul>
                            
                            {/* Mobile User Button */}
                            <div className="pt-4 border-t border-border">
                                <div className="flex items-center justify-center">
                                    <UserButton/>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}

export default AppHeader;