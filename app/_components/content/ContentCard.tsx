import Image from "next/image";
import Link from "next/link";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

interface ContentCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  creator: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  likes: number;
  comments: number;
  isLiked?: boolean;
  isPremium?: boolean;
  price?: number;
}

const ContentCard = ({
  id,
  title,
  description,
  imageUrl,
  creator,
  likes,
  comments,
  isLiked = false,
  isPremium = false,
  price,
}: ContentCardProps) => {
  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <figure className="relative aspect-video">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {isPremium && (
          <div className="absolute top-2 right-2">
            <div className="badge badge-secondary gap-2">
              <span className="text-xs">Premium</span>
              {price && <span className="text-xs">${price}</span>}
            </div>
          </div>
        )}
      </figure>

      <div className="card-body">
        <div className="flex items-center space-x-3 mb-3">
          <div className="avatar">
            <div className="w-8 h-8 rounded-full">
              <Image
                src={creator.avatarUrl}
                alt={creator.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
          </div>
          <Link
            href={`/creator/${creator.id}`}
            className="text-sm font-medium hover:text-primary"
          >
            {creator.name}
          </Link>
        </div>

        <Link href={`/content/${id}`}>
          <h2 className="card-title hover:text-primary transition-colors">
            {title}
          </h2>
          <p className="text-base-content/70 mt-2 line-clamp-2">
            {description}
          </p>
        </Link>

        <div className="card-actions justify-between items-center mt-4">
          <div className="flex space-x-4">
            <button className="btn btn-ghost btn-sm gap-2">
              {isLiked ? (
                <HeartIconSolid className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
              <span className="text-sm">{likes}</span>
            </button>
            <button className="btn btn-ghost btn-sm gap-2">
              <ChatBubbleLeftIcon className="h-5 w-5" />
              <span className="text-sm">{comments}</span>
            </button>
            <button className="btn btn-ghost btn-sm">
              <ShareIcon className="h-5 w-5" />
            </button>
          </div>

          {isPremium && (
            <button className="btn btn-primary btn-sm">订阅查看</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
