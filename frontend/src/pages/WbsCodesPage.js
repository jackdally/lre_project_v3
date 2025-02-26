// src/pages/WbsCodesPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function WbsCodesPage() {
  const { programId } = useParams();
  const navigate = useNavigate();

  // State for WBS Categories
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ category_name: '' });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryData, setEditingCategoryData] = useState({});

  // State for WBS Subcategories (global list)
  const [subcategories, setSubcategories] = useState([]);
  // newSubcategories: an object mapping category id to the new subcategory name for that category
  const [newSubcategories, setNewSubcategories] = useState({});

  // Inline editing for subcategories (only one at a time across the page)
  const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);
  const [editingSubcategoryData, setEditingSubcategoryData] = useState({});

  // Fetch WBS Categories for this program
  const fetchCategories = () => {
    axios.get('http://localhost:8000/wbs_categories/')
      .then(response => {
        const filtered = response.data.filter(cat => cat.program_id === parseInt(programId));
        setCategories(filtered);
      })
      .catch(error => console.error('Error fetching categories:', error));
  };

  // Fetch all WBS Subcategories
  const fetchSubcategories = () => {
    axios.get('http://localhost:8000/wbs_subcategories/')
      .then(response => {
        setSubcategories(response.data);
      })
      .catch(error => console.error('Error fetching subcategories:', error));
  };

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, [programId]);

  // ----------------- Category Handlers -----------------
  const handleCategoryInputChange = (e) => {
    setNewCategory({ ...newCategory, [e.target.name]: e.target.value });
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const data = {
      program_id: parseInt(programId),
      category_name: newCategory.category_name
    };
    axios.post('http://localhost:8000/wbs_categories/', data)
      .then(() => {
        fetchCategories();
        setNewCategory({ category_name: '' });
      })
      .catch(error => console.error('Error adding category:', error));
  };

  const handleEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryData({ ...cat });
  };

  const handleCategoryEditChange = (e) => {
    setEditingCategoryData({ ...editingCategoryData, [e.target.name]: e.target.value });
  };

  const handleUpdateCategory = (id) => {
    axios.put(`http://localhost:8000/wbs_categories/${id}`, editingCategoryData)
      .then(() => {
        setEditingCategoryId(null);
        fetchCategories();
      })
      .catch(error => console.error('Error updating category:', error));
  };

  const handleDeleteCategory = (id) => {
    axios.delete(`http://localhost:8000/wbs_categories/${id}`)
      .then(() => {
        fetchCategories();
        fetchSubcategories();
      })
      .catch(error => console.error('Error deleting category:', error));
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setEditingCategoryData({});
  };

  // ----------------- Subcategory Handlers -----------------
  const handleNewSubcategoryChange = (e, categoryId) => {
    setNewSubcategories({
      ...newSubcategories,
      [categoryId]: e.target.value
    });
  };

  const handleAddSubcategory = (e, categoryId) => {
    e.preventDefault();
    const subcategoryName = newSubcategories[categoryId];
    if (!subcategoryName) return;
    const data = {
      category_id: categoryId,
      subcategory_name: subcategoryName
    };
    axios.post('http://localhost:8000/wbs_subcategories/', data)
      .then(() => {
        fetchSubcategories();
        setNewSubcategories({
          ...newSubcategories,
          [categoryId]: ''
        });
      })
      .catch(error => console.error('Error adding subcategory:', error));
  };

  const handleEditSubcategory = (sub) => {
    setEditingSubcategoryId(sub.id);
    setEditingSubcategoryData({ ...sub });
  };

  const handleSubcategoryEditChange = (e) => {
    setEditingSubcategoryData({ ...editingSubcategoryData, [e.target.name]: e.target.value });
  };

  const handleUpdateSubcategory = (id) => {
    axios.put(`http://localhost:8000/wbs_subcategories/${id}`, editingSubcategoryData)
      .then(() => {
        setEditingSubcategoryId(null);
        fetchSubcategories();
      })
      .catch(error => console.error('Error updating subcategory:', error));
  };

  const handleDeleteSubcategory = (id) => {
    axios.delete(`http://localhost:8000/wbs_subcategories/${id}`)
      .then(() => {
        fetchSubcategories();
      })
      .catch(error => console.error('Error deleting subcategory:', error));
  };

  const handleCancelSubcategoryEdit = () => {
    setEditingSubcategoryId(null);
    setEditingSubcategoryData({});
  };

  // ----------------- Summary Table Data -----------------
  // Generate a summary list of Category - Subcategory pairs.
  const summaryData = [];
  categories.forEach(cat => {
    const subs = subcategories.filter(sub => sub.category_id === cat.id);
    if (subs.length > 0) {
      subs.forEach(sub => {
        summaryData.push({ category_name: cat.category_name, subcategory_name: sub.subcategory_name });
      });
    } else {
      summaryData.push({ category_name: cat.category_name, subcategory_name: 'None' });
    }
  });

  return (
    <div style={{ padding: '2rem' }}>
      {/* Back Button: Takes user back to their Program Dashboard */}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => navigate(`/dashboard/${programId}`)}>Back to Program Dashboard</button>
      </div>

      <h1>WBS Codes for Program {programId}</h1>

      {/* Summary Table */}
      <h2>Summary of Categories and Subcategories</h2>
      <table border="1" cellPadding="8" style={{ marginBottom: '2rem' }}>
        <thead>
          <tr>
            <th>Category Name</th>
            <th>Subcategory Name</th>
          </tr>
        </thead>
        <tbody>
          {summaryData.map((row, index) => (
            <tr key={index}>
              <td>{row.category_name}</td>
              <td>{row.subcategory_name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* WBS Categories Section */}
      <h2>WBS Categories</h2>
      <form onSubmit={handleAddCategory} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          name="category_name"
          placeholder="New Category Name"
          value={newCategory.category_name}
          onChange={handleCategoryInputChange}
          required
          style={{ marginRight: '0.5rem' }}
        />
        <button type="submit">Add Category</button>
      </form>
      <table border="1" cellPadding="8" style={{ marginBottom: '2rem' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>
                {editingCategoryId === cat.id ? (
                  <input
                    type="text"
                    name="category_name"
                    value={editingCategoryData.category_name}
                    onChange={handleCategoryEditChange}
                  />
                ) : (
                  cat.category_name
                )}
              </td>
              <td>
                {editingCategoryId === cat.id ? (
                  <>
                    <button onClick={() => handleUpdateCategory(cat.id)}>Save</button>
                    <button onClick={handleCancelCategoryEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditCategory(cat)}>Edit</button>
                    <button onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* For each category, display its own Subcategory Table */}
      {categories.map(cat => (
        <div key={cat.id} style={{ marginBottom: '2rem' }}>
          <h3>Subcategories for: {cat.category_name}</h3>
          <form onSubmit={(e) => handleAddSubcategory(e, cat.id)} style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              name="subcategory_name"
              placeholder="New Subcategory Name"
              value={newSubcategories[cat.id] || ''}
              onChange={(e) => handleNewSubcategoryChange(e, cat.id)}
              required
              style={{ marginRight: '0.5rem' }}
            />
            <button type="submit">Add Subcategory</button>
          </form>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category Name</th>
                <th>Subcategory Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subcategories
                .filter(sub => sub.category_id === cat.id)
                .map(sub => (
                  <tr key={sub.id}>
                    <td>{sub.id}</td>
                    <td>{cat.category_name}</td>
                    <td>
                      {editingSubcategoryId === sub.id ? (
                        <input
                          type="text"
                          name="subcategory_name"
                          value={editingSubcategoryData.subcategory_name}
                          onChange={handleSubcategoryEditChange}
                        />
                      ) : (
                        sub.subcategory_name
                      )}
                    </td>
                    <td>
                      {editingSubcategoryId === sub.id ? (
                        <>
                          <button onClick={() => handleUpdateSubcategory(sub.id)}>Save</button>
                          <button onClick={handleCancelSubcategoryEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditSubcategory(sub)}>Edit</button>
                          <button onClick={() => handleDeleteSubcategory(sub.id)}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default WbsCodesPage;
