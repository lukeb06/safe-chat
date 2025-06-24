import LogoutButton from '@/components/logout-button';
import { ModeToggle } from '@/components/mode-toggle';
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
                <Link href="/app/messages">
                    <h1 className="text-xl" style={{ viewTransitionName: 'title' }}>
                        safe-chat
                    </h1>
                </Link>

                <div className="flex-1 flex justify-end items-center gap-4">
                    <LogoutButton />
                    <ModeToggle />
                </div>
            </nav>

            <main className="w-full flex-1">{children}</main>
        </div>
    );
}
