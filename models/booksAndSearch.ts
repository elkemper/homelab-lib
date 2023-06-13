export interface SearchResult {
  BookID: string
  FirstName: string
  MiddleName: string
  LastName: string
  Title: string
}

export interface BookData {
  Folder: string
  FileName: string
  Ext: string
}

export interface BookDataWithSeries extends SearchResult {
  SeriesTitle: string
  SeqNumber: number
}
