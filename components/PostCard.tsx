import { formatTanggal, postImageUrl } from "@/lib/format";
import { categoryLabel, type Post } from "@/lib/types";

export function PostCard({ post }: { post: Post }) {
  const link = `/berita/${encodeURIComponent(post.slug)}`;
  const image = postImageUrl(post.image);
  const label = categoryLabel(post.category);

  return (
    <article className="news-card">
      <a
        className="news-card__media"
        href={link}
        tabIndex={-1}
        aria-hidden="true"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" loading="lazy" />
        ) : (
          <span className="news-card__placeholder" aria-hidden="true">
            {label.charAt(0)}
          </span>
        )}
        <span className={`news-card__badge badge--${post.category}`}>
          {label}
        </span>
      </a>
      <div className="news-card__body">
        <p className="news-card__date">
          <time dateTime={new Date(post.created_at).toISOString()}>
            {formatTanggal(post.created_at)}
          </time>
        </p>
        <h3>
          <a href={link}>{post.title}</a>
        </h3>
        <p className="news-card__excerpt">{post.excerpt}</p>
        <a className="link" href={link}>
          Baca selengkapnya <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}
