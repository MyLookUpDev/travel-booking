import React from 'react';

const Home = () => {
  return (
    <div className="bg-white text-gray-900">
      {/* Navbar */}
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Trovol</h1>
        <nav className="space-x-6">
          <a href="#home" className="hover:text-blue-500">Home</a>
          <a href="#about" className="hover:text-blue-500">About</a>
          <a href="#packages" className="hover:text-blue-500">Packages</a>
          <a href="#contact" className="hover:text-blue-500">Contact</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="h-screen bg-cover bg-center flex items-center justify-center text-white" style={{ backgroundImage: "url('/images/banner.jpg')" }}>
        <div className="text-center px-4">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">Explore the World with Trovol</h2>
          <p className="text-lg md:text-2xl mb-6">Adventure, Culture, and Relaxation in One Place</p>
          <a href="#packages" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full">Discover Packages</a>
        </div>
      </section>

      {/* Placeholder for other sections like About, Packages, Contact */}
      <section id="packages" className="py-16 px-6">
        <h3 className="text-3xl font-bold text-center mb-12">Our Packages</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg">
            <img src="/images/package1.jpg" alt="Package 1" className="w-full h-48 object-cover" />
            <div className="p-4">
              <h4 className="font-bold text-xl mb-2">Beach Paradise</h4>
              <p className="text-gray-600">Enjoy the ultimate beach experience with luxury and sun.</p>
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg">
            <img src="/images/package2.jpg" alt="Package 2" className="w-full h-48 object-cover" />
            <div className="p-4">
              <h4 className="font-bold text-xl mb-2">Mountain Adventure</h4>
              <p className="text-gray-600">Climb and conquer the peaks with guided adventure tours.</p>
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg">
            <img src="/images/package3.jpg" alt="Package 3" className="w-full h-48 object-cover" />
            <div className="p-4">
              <h4 className="font-bold text-xl mb-2">Cultural Journey</h4>
              <p className="text-gray-600">Immerse yourself in rich traditions and vibrant history.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 text-center">
        <p>&copy; 2025 Trovol Travel. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
