'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <header className="header">
        <div className="header-content">
          <Link href="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="logo-icon">🛒</div>
            <span>Smart Grocery Assistant</span>
          </Link>
          <nav>
            <ul className="nav-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/list">List</Link></li>
              <li><a href="#about" style={{ textDecoration: 'underline' }}>About</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="container">
        <h1>About Smart Grocery Assistant</h1>
        <p className="subtitle">Your intelligent grocery shopping companion</p>

        <div className="section">
          <h2 className="section-title">What We Do</h2>
          <p style={{ lineHeight: '1.8', color: '#64748b', marginBottom: '20px' }}>
            Smart Grocery Assistant is an AI-powered application designed to help you manage your grocery shopping 
            more efficiently. Our intelligent system learns from your shopping habits and provides personalized 
            suggestions to make your grocery shopping experience seamless.
          </p>
        </div>

        <div className="section">
          <h2 className="section-title">Key Features</h2>
          <div className="crud-guide">
            <div className="crud-item">
              <h3>🤖 AI-Powered Suggestions</h3>
              <p>Our rule-based AI analyzes your purchase history to predict what you might need.</p>
            </div>
            <div className="crud-item">
              <h3>💬 Interactive Chatbot</h3>
              <p>Chat with our assistant using natural language to add items and get recommendations.</p>
            </div>
            <div className="crud-item">
              <h3>🥗 Healthier Alternatives</h3>
              <p>Get suggestions for healthier food options based on your current list.</p>
            </div>
            <div className="crud-item">
              <h3>⏰ Expiry Reminders</h3>
              <p>Never waste food again with smart expiry date tracking and reminders.</p>
            </div>
            <div className="crud-item">
              <h3>📊 Full CRUD Operations</h3>
              <p>Complete Create, Read, Update, and Delete functionality for managing your list.</p>
            </div>
            <div className="crud-item">
              <h3>📱 Responsive Design</h3>
              <p>Works seamlessly on desktop, tablet, and mobile devices.</p>
            </div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Technology Stack</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="crud-item">
              <h3>Next.js 14</h3>
              <p>React framework with App Router</p>
            </div>
            <div className="crud-item">
              <h3>TypeScript</h3>
              <p>Type-safe development</p>
            </div>
            <div className="crud-item">
              <h3>RESTful API</h3>
              <p>Clean API architecture</p>
            </div>
            <div className="crud-item">
              <h3>Modern CSS</h3>
              <p>Professional styling</p>
            </div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">How It Works</h2>
          <ol style={{ lineHeight: '2', color: '#64748b', paddingLeft: '20px' }}>
            <li>Add items to your grocery list manually or through the chatbot</li>
            <li>Our AI analyzes your purchase history and suggests missing items</li>
            <li>Get healthier alternatives for items in your list</li>
            <li>Receive reminders about items that are expiring soon</li>
            <li>Mark items as purchased and track your shopping progress</li>
          </ol>
        </div>

        <div className="section" id="crud-guide">
          <h2 className="section-title">📊 CRUD Operations Guide</h2>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>
            Our application provides complete CRUD (Create, Read, Update, Delete) functionality for managing your grocery list.
          </p>
          <div className="crud-guide">
            <div className="crud-item">
              <h3>➕ CREATE</h3>
              <p>Add new items to your grocery list using the form above or chat with the assistant. All items are validated before being added.</p>
            </div>
            <div className="crud-item">
              <h3>📖 READ</h3>
              <p>View all your grocery items in the list. Items show category, purchase date, and expiry information. You can also fetch individual items by ID.</p>
            </div>
            <div className="crud-item">
              <h3>✏️ UPDATE</h3>
              <p>Click the "Edit" button on any item to modify its name, category, or dates. Changes are validated and saved immediately.</p>
            </div>
            <div className="crud-item">
              <h3>🗑️ DELETE</h3>
              <p>Click the "Delete" button to remove items from your list. You'll be asked to confirm before deletion to prevent accidents.</p>
            </div>
          </div>
        </div>

        <div className="section" style={{ textAlign: 'center', padding: '40px 0' }}>
          <Link href="/" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}

