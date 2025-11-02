import React, { useState } from 'react';
import './SearchPage.css';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="search-container">
      <h1 className="search-title">Tra cứu thông tin</h1>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-container">
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nhập CCCD/CMND nhân khẩu hoặc chủ hộ khẩu"
          />
          <button type="submit" className="search-button">
            Tìm kiếm
          </button>
        </div>
      </form>

      <div className="search-results">
        {/* Search results will be displayed here */}
      </div>
    </div>
  );
};

export default SearchPage;
