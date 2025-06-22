import ConvoList from '@/components/messages';

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full h-full flex">
            <div className="h-full min-w-48 bg-red-500 flex flex-col gap-4">
                <ConvoList />
            </div>

            <div className="flex-1 h-full">{children}</div>
        </div>
    );
}
