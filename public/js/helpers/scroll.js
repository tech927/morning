export class InfiniteScroll {
  constructor(container, loadMore, options = {}) {
    this.container = container;
    this.loadMore = loadMore;
    this.options = {
      threshold: 100,
      loading: false,
      hasMore: true,
      ...options
    };
    
    this.observer = null;
    this.sentinel = null;
    this.init();
  }

  init() {
    this.createSentinel();
    this.setupObserver();
  }

  createSentinel() {
    this.sentinel = document.createElement('div');
    this.sentinel.className = 'scroll-sentinel';
    this.sentinel.style.height = '1px';
    this.sentinel.style.visibility = 'hidden';
    this.container.appendChild(this.sentinel);
  }

  setupObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && 
              !this.options.loading && 
              this.options.hasMore) {
            this.loadMoreContent();
          }
        });
      },
      {
        root: this.container,
        threshold: 0.1
      }
    );

    this.observer.observe(this.sentinel);
  }

  async loadMoreContent() {
    if (this.options.loading || !this.options.hasMore) return;

    this.options.loading = true;
    
    try {
      await this.loadMore();
    } catch (error) {
      console.error('Error loading more content:', error);
    } finally {
      this.options.loading = false;
    }
  }

  setHasMore(hasMore) {
    this.options.hasMore = hasMore;
    if (!hasMore && this.sentinel) {
      this.sentinel.style.display = 'none';
    }
  }

  setLoading(loading) {
    this.options.loading = loading;
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.sentinel && this.sentinel.parentNode) {
      this.sentinel.parentNode.removeChild(this.sentinel);
    }
  }

  refresh() {
    this.disconnect();
    this.init();
  }
}

export class TikTokScroll {
  constructor(container, items, options = {}) {
    this.container = container;
    this.items = items;
    this.currentIndex = 0;
    this.options = {
      snap: true,
      ...options
    };
    
    this.isScrolling = false;
    this.lastScrollTime = 0;
    this.init();
  }

  init() {
    this.setupStyles();
    this.setupEvents();
    this.showItem(0);
  }

  setupStyles() {
    this.container.style.scrollSnapType = 'y mandatory';
    this.container.style.overflowY = 'scroll';
    this.container.style.height = '100vh';
    this.container.style.scrollBehavior = 'smooth';
    
    this.items.forEach(item => {
      item.style.scrollSnapAlign = 'start';
      item.style.minHeight = '100vh';
    });
  }

  setupEvents() {
    let touchStartY = 0;
    let isSwiping = false;

    this.container.addEventListener('scroll', () => {
      if (this.isScrolling) return;
      
      const now = Date.now();
      if (now - this.lastScrollTime < 100) return;
      
      this.lastScrollTime = now;
      this.updateCurrentIndex();
    });

    // Touch events for mobile
    this.container.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      isSwiping = true;
    });

    this.container.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      
      const touchY = e.touches[0].clientY;
      const diffY = touchY - touchStartY;
      
      if (Math.abs(diffY) > 10) {
        this.isScrolling = true;
      }
    });

    this.container.addEventListener('touchend', () => {
      isSwiping = false;
      this.isScrolling = false;
      this.updateCurrentIndex();
    });
  }

  updateCurrentIndex() {
    const containerRect = this.container.getBoundingClientRect();
    let closestIndex = 0;
    let closestDistance = Infinity;

    this.items.forEach((item, index) => {
      const itemRect = item.getBoundingClientRect();
      const distance = Math.abs(itemRect.top - containerRect.top);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== this.currentIndex) {
      this.currentIndex = closestIndex;
      this.onItemChange(this.currentIndex);
    }
  }

  showItem(index) {
    if (index < 0 || index >= this.items.length) return;
    
    this.isScrolling = true;
    this.currentIndex = index;
    
    this.items[index].scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    setTimeout(() => {
      this.isScrolling = false;
    }, 500);
  }

  next() {
    this.showItem(this.currentIndex + 1);
  }

  previous() {
    this.showItem(this.currentIndex - 1);
  }

  onItemChange(index) {
    // Can be overridden by user
    if (this.options.onItemChange) {
      this.options.onItemChange(index, this.items[index]);
    }
  }

  destroy() {
    this.container.style.scrollSnapType = '';
    this.container.style.overflowY = '';
    this.container.style.height = '';
    this.container.style.scrollBehavior = '';
    
    this.items.forEach(item => {
      item.style.scrollSnapAlign = '';
      item.style.minHeight = '';
    });
  }
  }
