export default function ConvoListSkeleton() {
    return (
        <>
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
            <ConvoListItemSkeleton />
        </>
    );
}

function ConvoListItemSkeleton() {
    return (
        <div className="flex items-center gap-4 py-2 px-4 hover:bg-foreground/5 rounded cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-foreground/10 animate-pulse" />
            <div className="flex flex-col gap-1">
                <span className="bg-foreground/10 text-transparent rounded animate-pulse">
                    demouser1
                </span>
                <span className="bg-foreground/10 text-transparent rounded animate-pulse">
                    Hello world!
                </span>
            </div>
        </div>
    );
}
