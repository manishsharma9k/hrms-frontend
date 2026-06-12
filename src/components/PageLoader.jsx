const PageLoader = ({ text = 'Loading...' }) => (
    <div className="page-loading-overlay">
        <div className="spinner" />
        <p>{text}</p>
    </div>
);

// Skeleton row for tables
export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
    <tbody>
        {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
                {Array.from({ length: cols }).map((_, j) => (
                    <td key={j} style={{ padding: '0.875rem 1.25rem' }}>
                        <div className="skeleton skeleton-text" style={{ width: j === 0 ? '70%' : j === cols - 1 ? '50%' : '80%' }} />
                    </td>
                ))}
            </tr>
        ))}
    </tbody>
);

// Skeleton card grid
export const CardSkeleton = ({ count = 4 }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="skeleton-card">
                <div className="skeleton skeleton-avatar" style={{ width: 44, height: 44, marginBottom: '1rem' }} />
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-text" style={{ width: '40%' }} />
            </div>
        ))}
    </div>
);

export default PageLoader;
