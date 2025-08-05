interface TweetCardProps {
  id: string;
  className?: string;
}

export function TweetCard({ id, className }: TweetCardProps) {
  return (
    <div className={`bg-neutral-800/50 rounded-lg p-4 ${className}`}>
      <p className="text-sm text-neutral-400">Tweet {id}</p>
    </div>
  );
}