
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, BookOpen, Trash2, Library, Sparkles, Loader2 } from 'lucide-react';
import { Book } from './types';
import { getBookInsights } from './services/gemini';

const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedBooks = localStorage.getItem('lumina_books');
    if (savedBooks) {
      try {
        setBooks(JSON.parse(savedBooks));
      } catch (e) {
        console.error("Failed to parse local books", e);
      }
    }
  }, []);

  // Save to local storage whenever books change
  useEffect(() => {
    localStorage.setItem('lumina_books', JSON.stringify(books));
  }, [books]);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    setIsSubmitting(true);
    const newBook: Book = {
      id: crypto.randomUUID(),
      title,
      author,
      addedAt: Date.now(),
      isGenerating: true,
    };

    setBooks(prev => [newBook, ...prev]);
    setTitle('');
    setAuthor('');

    // Fetch AI insights
    const insights = await getBookInsights(title, author);
    
    setBooks(prev => prev.map(book => 
      book.id === newBook.id 
        ? { ...book, ...insights, isGenerating: false } 
        : book
    ));
    
    setIsSubmitting(false);
  };

  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 mb-8">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-indigo-200 shadow-lg">
              <Library className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Lumina Library</h1>
          </div>
          <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {books.length} {books.length === 1 ? 'Book' : 'Books'}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-4xl">
        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-12">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">New Entry</h2>
          </div>
          <form onSubmit={handleAddBook} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Midnight Library" 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Author</label>
              <input 
                type="text" 
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Matt Haig" 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                <span>Add</span>
              </button>
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Recently Added</h2>
          </div>

          {books.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Library className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Your reading list is currently empty.</p>
              <p className="text-slate-400 text-sm">Start by adding your first book above.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {books.map((book) => (
                <div 
                  key={book.id} 
                  className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                        {book.category || (book.isGenerating ? "Analyzing..." : "Book")}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(book.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 truncate leading-tight">{book.title}</h3>
                    <p className="text-slate-500 font-medium mb-2">{book.author}</p>
                    
                    <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg">
                      {book.isGenerating ? (
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          <span className="italic">Generating AI insights...</span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 text-slate-600 text-sm">
                          <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
                          <p className="italic leading-relaxed">{book.insight}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <button 
                      onClick={() => deleteBook(book.id)}
                      className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Remove from list"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-sm border-t border-slate-100 py-3 text-center text-xs text-slate-400">
        Lumina Library &bull; Designed for Readers
      </footer>
    </div>
  );
};

export default App;
