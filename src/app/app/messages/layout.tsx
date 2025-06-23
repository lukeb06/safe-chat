import ConvoList from '@/components/messages';

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full h-full flex">
            <div className="h-full min-w-48 bg-foreground/5 border-r flex flex-col p-2 gap-4 overflow-y-auto">
                <ConvoList />
            </div>

            <div className="flex-1 h-full">{children}</div>
        </div>
    );
}
