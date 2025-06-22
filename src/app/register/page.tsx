'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register } from '@/lib/actions';
import { useCookies } from 'next-client-cookies';
import { Link, useTransitionRouter } from 'next-view-transitions';

export default function RegisterPage() {
    const cookies = useCookies();
    const router = useTransitionRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (!username || !password) return alert('Please fill in all fields');
        if (password !== confirmPassword) return alert('Passwords do not match');

        const { accessToken, error } = await register(username, password);

        if (error || !accessToken) return alert(error || 'Unknown error');

        cookies.set('accessToken', accessToken);
        router.push('/app');
    };

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
                        <Input type="text" id="username" name="username" />
                    </div>

                    <div
                        className="flex flex-col gap-1"
                        style={{ viewTransitionName: 'form-password' }}
                    >
                        <Label htmlFor="password">Password</Label>
                        <Input type="password" id="password" name="password" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input type="password" id="confirmPassword" name="confirmPassword" />
                    </div>

                    <Button style={{ viewTransitionName: 'form-submit' }}>Register</Button>

                    <p style={{ viewTransitionName: 'form-change' }}>
                        Already have an account?{' '}
                        <Link href="/login" className="underline">
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
