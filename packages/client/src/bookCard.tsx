import React from 'react';
import config from './config';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Book {
  BookID: number;
  Title: string;
  Author: string;
  Cover: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  Lang: string;
  // Add other properties of a book if known
}

interface BookCardProps {
  book: Book;
}

export default function BookCard(props: BookCardProps) {
  const { book } = props;

  const url = `/books/${book.BookID}/download`;
  const navigate = useNavigate();

  const httpClient = axios.create({
    baseURL: config.apiUrl,
  });

  const sendRequest = async (method: any, url: string, data?: any): Promise<void> => {
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

      window.location.href = config.apiUrl + response.data.downloadUrl;
    } catch (error) {
      if (error?.response?.status) {
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

  const downloadBook = async (bookId: number) => {
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
        <button className="button--download" onClick={() => downloadBook(book.BookID)}>
          Download
        </button>
      </div>
    </div>
  );
}
