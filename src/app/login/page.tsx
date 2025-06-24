'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useTransitionRouter } from 'next-view-transitions';
import { useCookies } from 'next-client-cookies';
import { getUserFromAccessToken, login } from '@/lib/actions';
import { useEffect } from 'react';

export default function LoginPage() {
    const cookies = useCookies();
    const _accessToken = cookies.get('accessToken');
    const router = useTransitionRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        if (!username || !password) return alert('Please fill in all fields');

        const accessToken = await login(username, password);

        if (!accessToken) return alert('Invalid username or password');

        cookies.set('accessToken', accessToken);
        router.push('/app/messages');
    };

    const demoLogin = async (e: any) => {
        e.preventDefault();
        e.stopPropagation();

        const accessToken = await login('demouser1', 'password');

        if (!accessToken) return alert('An error occurred');

        cookies.set('accessToken', accessToken);
        router.push('/app/messages');
    };

    useEffect(() => {
        (async () => {
            if (!_accessToken) return;
            const myUser = await getUserFromAccessToken(_accessToken);
            if (myUser) router.push('/app/messages');
        })();
    });

    return (
        <div className="w-full h-full grid place-items-center">
            <div className="flex flex-col gap-8 items-center">
                <h1 className="text-2xl" style={{ viewTransitionName: 'title' }}>
                    safe-chat
                </h1>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div
                        className="flex flex-col gap-1"
                        style={{ viewTransitionName: 'form-username' }}
                    >
                        <Label htmlFor="username">Username</Label>
                        <Input type="text" id="username" name="username" required />
                    </div>

                    <div
                        className="flex flex-col gap-1"
                        style={{ viewTransitionName: 'form-password' }}
                    >
                        <Label htmlFor="password">Password</Label>
                        <Input type="password" id="password" name="password" required />
                    </div>

                    <Button style={{ viewTransitionName: 'form-submit' }}>Login</Button>

                    <Button variant="outline" onClick={demoLogin}>
                        Demo Login
                    </Button>

                    <p style={{ viewTransitionName: 'form-change' }}>
                        Don't have an account?{' '}
                        <Link href="/register" className="underline">
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
