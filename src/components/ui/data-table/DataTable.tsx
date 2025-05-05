
import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Определяем типы для колонок и данных
interface SortDirection {
  column: string;
  direction: "asc" | "desc";
}

export interface DataTableColumn<T> {
  key: string;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  searchable?: boolean;
  searchColumn?: string;
  searchPlaceholder?: string;
  pagination?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  searchable = true,
  searchColumn,
  searchPlaceholder = "Поиск...",
  pagination = true,
}: DataTableProps<T>) {
  // Состояния для поиска, сортировки и пагинации
  const [searchQuery, setSearchQuery] = useState("");
  const [sortState, setSortState] = useState<SortDirection | null>(null);
  
  // Пагинация
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Фильтрация данных по поисковому запросу
  const filteredData = useMemo(() => {
    if (!searchQuery || !searchColumn) return data;
    
    return data.filter(item => {
      const value = item[searchColumn];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (typeof value === 'number') {
        return value.toString().includes(searchQuery);
      }
      return false;
    });
  }, [data, searchQuery, searchColumn]);

  // Сортировка данных
  const sortedData = useMemo(() => {
    if (!sortState) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const valueA = a[sortState.column];
      const valueB = b[sortState.column];
      
      if (valueA === valueB) return 0;
      
      let comparison = 0;
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        comparison = valueA.localeCompare(valueB);
      } else {
        comparison = valueA > valueB ? 1 : -1;
      }
      
      return sortState.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortState]);

  // Данные для текущей страницы
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const start = page * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize, pagination]);

  // Обработчик изменения сортировки
  const handleSort = (column: string) => {
    if (!sortState || sortState.column !== column) {
      setSortState({ column, direction: 'asc' });
    } else if (sortState.direction === 'asc') {
      setSortState({ column, direction: 'desc' });
    } else {
      setSortState(null);
    }
  };

  // Сброс страницы при изменении поискового запроса или размера страницы
  useEffect(() => {
    setPage(0);
  }, [searchQuery, pageSize]);

  // Получение иконки сортировки
  const getSortIcon = (column: string) => {
    if (!sortState || sortState.column !== column) {
      return <Icon name="ArrowUpDown" className="ml-2 h-4 w-4" />;
    }
    return sortState.direction === 'asc' 
      ? <Icon name="ArrowUp" className="ml-2 h-4 w-4" />
      : <Icon name="ArrowDown" className="ml-2 h-4 w-4" />;
  };

  // Количество страниц
  const pageCount = Math.ceil(sortedData.length / pageSize);

  return (
    <div className="space-y-4">
      {/* Строка поиска */}
      {searchable && searchColumn && (
        <div className="flex items-center justify-between">
          <div className="relative flex max-w-sm items-center">
            <Icon
              name="Search"
              className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}

      {/* Таблица */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>
                  {column.sortable ? (
                    <button
                      className="flex items-center font-medium text-left"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.title}
                      {getSortIcon(column.key)}
                    </button>
                  ) : (
                    column.title
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column.key}`}>
                      {column.render 
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Нет данных
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Пагинация */}
      {pagination && sortedData.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            Показано {paginatedData.length} из {sortedData.length} записей
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Записей на странице</p>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize.toString()} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Страница {page + 1} из {pageCount || 1}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setPage(0)}
                disabled={page === 0}
              >
                <span className="sr-only">На первую страницу</span>
                <Icon name="ChevronsLeft" className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <span className="sr-only">На предыдущую страницу</span>
                <Icon name="ChevronLeft" className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
                disabled={page === pageCount - 1 || pageCount === 0}
              >
                <span className="sr-only">На следующую страницу</span>
                <Icon name="ChevronRight" className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setPage(pageCount - 1)}
                disabled={page === pageCount - 1 || pageCount === 0}
              >
                <span className="sr-only">На последнюю страницу</span>
                <Icon name="ChevronsRight" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
