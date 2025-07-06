import React from 'react';
import config from './config';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function BookCard(props) {
  const { book } = props;

  const url = `/books/${book.BookID}/download`;
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

      return (window.location = config.apiUrl + response.data.downloadUrl);
    } catch (error) {
      if (error.response) {
        const { status } = error.response;
        debugger;
        if (status === 401) {
          localStorage.removeItem('token');
          window.dispatchEvent(new Event('storage'));
          navigate('/');
        } else if (status === 404) {
          console.error(error);
        }
      } else if (error.request) {
        console.error(error);
      }
      console.error(error);

      throw error;
    }
  };

  const downloadBook = async (bookId) => {
    await sendRequest('GET', url);
  };
  return (
    <div className="card">
      <div className="card--content">
        <h3 className="card--title">{book.Title}</h3>
        <p>
          <small>Author: {book.FirstName + ' ' + book.MiddleName + ' ' + book.LastName}</small>
        </p>
        <small>Language: {book.Lang}</small>
        <br />
        <button className="button--download" onClick={downloadBook}>
          Download
        </button>
      </div>
    </div>
  );
}
