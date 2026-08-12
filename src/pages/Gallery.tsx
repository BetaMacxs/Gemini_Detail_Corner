export function Gallery() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-brand-text-primary sm:text-5xl md:text-6xl mb-8">
        Our <span className="text-brand-accent">Gallery</span>
      </h1>
      <p className="max-w-2xl mx-auto text-xl text-brand-text-secondary mb-12">
        See the results of our premium products in action.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-w-16 aspect-h-9 bg-brand-bg/80 rounded-2xl overflow-hidden border border-brand-border">
            <div className="flex items-center justify-center h-full text-brand-text-secondary">
              Gallery Image {i}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
