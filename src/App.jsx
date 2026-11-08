import { useState, useEffect } from 'react';
import './App.css';
import LiquidGlassFilter from './component/LiquidGlassFilter';
const API_URL = 'https://671891927fc4c5ff8f49fcac.mockapi.io/v2';

const fields = [
  { name: 'name', label: 'Name' },
  { name: 'desc', label: 'Description' },
  { name: 'address', label: 'Address' },
  { name: 'genre', label: 'Genre' },
  { name: 'color', label: 'Color' },
  { name: 'email', label: 'Email' },
  { name: 'phone', label: 'Phone' },
  { name: 'timezone', label: 'Timezone' },
  { name: 'building', label: 'Building' },
  { name: 'music', label: 'Music' },
  { name: 'password', label: 'Password' },
  { name: 'city', label: 'City' },
  { name: 'country', label: 'Country' },
  { name: 'street', label: 'Street' },
  { name: 'state', label: 'State' },
  { name: 'zipcode', label: 'Zipcode' },
  { name: 'company', label: 'Company' },
  { name: 'dob', label: 'Dob' },
  { name: 'fincode', label: 'Fincode' },
  { name: 'ip', label: 'Ip' },
  { name: 'job', label: 'Job' },
  { name: 'jd', label: 'Jd' },
  { name: 'typeofjob', label: 'Type of job' },
];

// Giá trị khởi tạo
const emptyForm = {
  name: '', desc: '', address: '', genre: '', color: '#000000',
  email: '', phone: '', timezone: '', building: '', music: '',
  password: '', city: '', country: '', street: '', state: '',
  zipcode: '', company: '', dob: '', fincode: '', ip: '',
  job: '', jd: '', typeofjob: '',
};

const PAGE_SIZE = 20;

function App() {
  const [users, setUsers] = useState([]);
  const [glassScale] = useState(700);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        alert('Loi tai dl!');
        setLoading(false);
      });
  }, []);

  const updateValue = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData, [name]: value
    });
  };

  const openAddForm = () => {
    setEditId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setEditId(user.id);
    setFormData({ ...emptyForm, ...user });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name.trim() === '') {
      alert('Vui lòng nhập Name!');
      return;
    }

    try {
      if (editId === null) {
        // ==THÊM==
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Thêm thất bại');
        const newUser = await response.json();
        setUsers([newUser, ...users]); // thêm vào đầu mảng
        alert('Thêm user thành công!');
      } else {
        // ==== SỬA ==
        const response = await fetch(`${API_URL}/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Sửa thất bại');
        const updatedUser = await response.json();
        // thay user cũ bằng user mới trong mảng
        const newList = [];
        for (let i = 0; i < users.length; i++) {
          if (users[i].id === editId) {
            newList.push(updatedUser);
          } else {
            newList.push(users[i]);
          }
        }
        setUsers(newList);
        alert('Cập nhật user thành công!');
      }
      closeForm();
    } catch (error) {
      alert('Có lỗi xảy ra: ' + error.message);
    }
  };

  // == XÓA =====
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa user này không?')) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Xóa thất bại');
      const newList = [];
      for (let i = 0; i < users.length; i++) {
        if (users[i].id !== id) {
          newList.push(users[i]);
        }
      }
      setUsers(newList);
      if (editId === id) closeForm();
    } catch (error) {
      alert('Có lỗi xảy ra: ' + error.message);
    }
  };

  // sort tren mang co san, ko goi lai api
  const sortedUsers = [...users];
  if (sortField !== '') {
    sortedUsers.sort((a, b) => {
      let valueA = a[sortField] || '';
      let valueB = b[sortField] || '';
      let result = 0;
      if (sortField === 'id') {
        result = Number(valueA) - Number(valueB);
      } else {
        result = String(valueA).localeCompare(String(valueB));
      }
      if (sortOrder === 'desc') {
        result = -result;
      }
      return result;
    });
  }

  // chi lay so dong dang hien
  const displayUsers = [];
  for (let i = 0; i < sortedUsers.length && i < visibleCount; i++) {
    displayUsers.push(sortedUsers[i]);
  }

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 200 && visibleCount < sortedUsers.length) {
      setVisibleCount(visibleCount + PAGE_SIZE);
    }
  };

  // tao cac o input cho form
  const formInputs = [];
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    let input;
    if (field.name === 'genre') {
      input = (
        <select name="genre" value={formData.genre} onChange={updateValue} className="liquid-glass-input">
          <option value="">--</option>
          <option value="male">male</option>
          <option value="female">female</option>
          <option value="center">center</option>
        </select>
      );
    } else if (field.name === 'color') {
      input = (
        <input
          type="color"
          name="color"
          value={formData.color.slice(0, 7)}
          onChange={updateValue}
          className="liquid-glass-input input-color"
        />
      );
    } else {
      input = (
        <input
          type="text"
          name={field.name}
          value={formData[field.name]}
          onChange={updateValue}
          className="liquid-glass-input"
        />
      );
    }
    formInputs.push(
      <div className="form-item" key={field.name}>
        <label>{field.label}</label>
        {input}
      </div>
    );
  }

  // option cho o sort + tieu de cot (bo cot color)
  const sortOptions = [];
  const tableHeaders = [];
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].name === 'color') continue;
    sortOptions.push(<option key={fields[i].name} value={fields[i].name}>{fields[i].label}</option>);
    tableHeaders.push(<th key={fields[i].name}>{fields[i].label.toUpperCase()}</th>);
  }

  // tao cac dong cua bang
  const tableRows = [];
  for (let i = 0; i < displayUsers.length; i++) {
    const user = displayUsers[i];

    const cells = [];
    for (let j = 0; j < fields.length; j++) {
      const key = fields[j].name;
      if (key === 'color') continue;
      cells.push(
        <td key={key} className={key === 'desc' ? 'td-long' : ''} title={user[key]}>
          {user[key]}
        </td>
      );
    }

    let rowColor = 'rgba(255, 255, 255, 0.41)';
    if (user.color) {
      rowColor = user.color.slice(0, 7) + '40';
    }

    tableRows.push(
      <tr key={user.id} style={{ backgroundColor: rowColor }} className="liquid-glass-row">
        <td>
          <button className="btn-small btn-edit" onClick={() => openEditForm(user)}>Sửa</button>
          <button className="btn-small btn-delete" onClick={() => handleDelete(user.id)}>Xóa</button>
        </td>
        <td>{user.id}</td>
        <td>
          {user.avatar ? <img src={user.avatar} alt="avatar" className="table-avatar" /> : '—'}
        </td>
        {cells}
      </tr>
    );
  }

  return (
    <div className="container">
      <LiquidGlassFilter scale={glassScale} />
      <h1 className="title">Danh sách Users</h1>
      <div className="button-crud">
        <button className="button-action" onClick={showForm ? closeForm : openAddForm}>
          {showForm ? 'Ẩn Form' : 'Thêm User'}
        </button>
      </div>

      {/* Them sua  */}
      {showForm && (
        <form onSubmit={handleSubmit} className="liquid-glass-card">
          <h3 className="form-title">
            {editId === null ? 'Nhập thông tin User mới' : `Sửa User có ID: ${editId}`}
          </h3>

          <div className="form-grid">
            {formInputs}
          </div>

          <div className="form-buttons">
            <button type="submit" className="button-action">
              {editId === null ? 'Lưu User' : 'Cập nhật'}
            </button>
            <button type="button" className="button-action" onClick={closeForm}>
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="toolbar">
        <span>Sắp xếp theo:</span>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="button-action select-sort"
        >
          <option value="">-- Mặc định --</option>
          <option value="id">ID</option>
          {sortOptions}
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="button-action select-sort"
        >
          <option value="asc">Tăng dần (A → Z)</option>
          <option value="desc">Giảm dần (Z → A)</option>
        </select>
      </div>

      <div className="liquid-glass-card table-wrapper" onScroll={handleScroll}>
        {loading ? (
          <p className="loading-text">Đang tải dữ liệu...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ACTION</th>
                <th>ID</th>
                <th>AVATAR</th>
                {tableHeaders}
              </tr>
            </thead>
            <tbody>
              {tableRows}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
