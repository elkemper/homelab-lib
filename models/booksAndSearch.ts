export interface SearchResult {
  BookID: string;
  Title: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  Lang: string;
}

export interface BookData {
  Folder: string;
  FileName: string;
  Ext: string;
}

export interface BookDataWithSeries extends SearchResult {
  SeriesTitle: string;
  SeqNumber: number;
}
