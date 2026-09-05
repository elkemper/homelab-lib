export interface SearchResult {
  BookID: string;
  Title: string;
  Lang: string;
  authors: string;
  SeriesTitle: string | null;
  SeqNumber: number | null;
}

export interface BookData {
  Folder: string;
  FileName: string;
  Ext: string;
}

export interface BookDataWithSeries {
  BookID: string;
  Title: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  Lang: string;
  SeriesTitle: string;
  SeqNumber: number;
}
