import LogoutButton from '@/components/logout-button';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { getCookies } from 'next-client-cookies/server';
import { Link } from 'next-view-transitions';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const cookies = await getCookies();
    const accessToken = cookies.get('accessToken');

    if (!accessToken) return redirect('/login');

    return (
        <div className="w-full h-full flex flex-col">
            <nav className="w-full bg-foreground/5 flex items-center p-4 gap-4 border-b">
                <Link href="/app/channel">
                    <h1 className="text-xl" style={{ viewTransitionName: 'title' }}>
                        safe-chat
                    </h1>
                </Link>

                <div className="flex-1 flex justify-end items-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/app/channel/edit">
                            <div className="flex items-center gap-2">
                                <span>My Channels</span>
                            </div>
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/app/channel/new">
                            <div className="flex items-center gap-2">
                                <PlusIcon />
                                <span>Create a channel</span>
                            </div>
                        </Link>
                    </Button>
                    <ModeToggle />
                    <LogoutButton />
                </div>
            </nav>

            <main className="w-full flex-1">{children}</main>
        </div>
    );
}
