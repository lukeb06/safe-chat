import { getChannels } from '@/lib/actions';
import { getCookies } from 'next-client-cookies/server';
import EditChannelsClient from './client';

export default async function EditChannelsPage() {
    const cookies = await getCookies();
    const accessToken = cookies.get('accessToken');
    if (!accessToken) return null;

    const { myChannels } = await getChannels(accessToken);

    return (
        <div className="w-full h-full grid place-items-center">
            <div className="flex flex-col gap-8 items-center">
                <h1 className="text-2xl">My Channels</h1>
                <EditChannelsClient myChannels={myChannels} />
            </div>
        </div>
    );
}
