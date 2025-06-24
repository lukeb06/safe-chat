'use client';

import { Button } from '@/components/ui/button';
import { LogOutIcon } from 'lucide-react';
import { useCookies } from 'next-client-cookies';
import { useTransitionRouter } from 'next-view-transitions';

export default function LogoutButton() {
    const cookies = useCookies();
    const router = useTransitionRouter();

    return (
        <Button
            size="icon"
            variant="outline"
            onClick={() => {
                cookies.remove('accessToken');
                cookies.remove('refreshToken');
                router.push('/login');
            }}
        >
            <LogOutIcon />
        </Button>
    );
}
