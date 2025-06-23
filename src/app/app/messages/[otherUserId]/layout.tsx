import MessageClient from './client';

export default async function MessageLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: any;
}) {
    const { otherUserId } = await params;
    if (isNaN(otherUserId)) return null;

    return (
        <div className="w-full h-full flex flex-col">
            <div className="w-full flex-1 relative">
                <div className="absolute top-0 left-0 inset-0 w-full h-full flex flex-col">
                    {children}
                </div>
            </div>
            <MessageClient otherUserId={parseInt(otherUserId)} />
        </div>
    );
}
