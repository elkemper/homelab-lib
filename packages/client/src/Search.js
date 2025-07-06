import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import config from './config';
import BookCard from './bookCard';
import axios from 'axios';

export default function Search() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [pageNo, setPageNo] = useState(0);
  const [count, setCount] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const httpClient = axios.create({
    baseURL: config.apiUrl,
    url: '',
  });

  const sendRequest = async (method, url, data) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await httpClient.request({
        method,
        url,
        headers,
        data,
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 401) {
          localStorage.removeItem('token');
          window.dispatchEvent(new Event('storage'));
          navigate('/');
        } else {
          console.error(error);
        }
      } else if (error.request) {
        console.error(error);
      } else {
        console.error(error);
      }

      throw error;
    }
  };

  const searchBooks = async (event) => {
    event.preventDefault();
    if (query === '') {
      return;
    }
    console.log('searching');
    setLoading(true);
    setBooks([]);
    const url = `search?q=${query}${pageNo ? '&p=' + pageNo : ''}`;

    try {
      console.log(query);
      const data = await sendRequest('GET', url);
      console.log(data);
      setLoading(false);
      setBooks(data.result);
      if (data.count) {
        setCount(data.count);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const Loading = () => {
    return (
      <div>
        <h4 className="loading-bar">Loading</h4>
      </div>
    );
  };

  return (
    <>
      <form className="form" onSubmit={searchBooks}>
        <label className="label" htmlFor="query">
          Поиск книг:
        </label>
        <input className="input" type="text" placeholder="Пример: Оруэлл 1984" name="q" value={query} onChange={(e) => setQuery(e.target.value)}></input>
        <button className="button" type="submit">
          Search
        </button>
        <label className="label" htmlFor="pageNo">
          Page:{' '}
        </label>
        <input className="input" type="text" name="p" value={pageNo} onChange={(e) => setPageNo(e.target.value)}></input>
        <div>
          <label className="label" htmlFor="count">
            Found books: {count}
          </label>
        </div>
      </form>
      {isLoading ? <Loading /> : null}
      <div className="card-list">
        {books.map((book) => (
          <BookCard book={book} key={book.BookID} />
        ))}
      </div>
    </>
  );
}
