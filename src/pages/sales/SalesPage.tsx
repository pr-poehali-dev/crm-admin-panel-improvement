
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { salesApi, Sale } from "@/components/api/apiClient";
import Icon from "@/components/ui/icon";
import { toast } from "@/components/ui/use-toast";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SalesPage = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const response = await salesApi.getAll();
      if (response.data) {
        setSales(response.data);
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось загрузить продажи",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ошибка при загрузке продаж:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить продажи",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить эту продажу?")) {
      try {
        const response = await salesApi.delete(id);
        if (response.status === 200) {
          setSales(sales.filter(sale => sale.id !== id));
          toast({
            title: "Успешно",
            description: "Продажа успешно удалена",
          });
        } else {
          toast({
            title: "Ошибка",
            description: response.error || "Не удалось удалить продажу",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Ошибка при удалении продажи:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось удалить продажу",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status: Sale['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Завершена</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">В процессе</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Отменена</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Фильтрация продаж по статусу
  const filteredSales = statusFilter 
    ? sales.filter(sale => sale.status === statusFilter)
    : sales;

  const columns: DataTableColumn<Sale>[] = [
    {
      key: "id",
      title: "ID",
      sortable: true,
      render: (value) => <div className="font-medium">{value}</div>,
    },
    {
      key: "clientId",
      title: "ID клиента",
      sortable: true,
    },
    {
      key: "amount",
      title: "Сумма",
      sortable: true,
      render: (value) => formatCurrency(value),
    },
    {
      key: "status",
      title: "Статус",
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
    {
      key: "date",
      title: "Дата",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "products",
      title: "Товары",
      render: (value) => <span>{value.length} товаров</span>,
    },
    {
      key: "actions",
      title: "Действия",
      render: (_, sale) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/sales/${sale.id}/edit`)}
          >
            <Icon name="Pencil" className="h-4 w-4" />
            <span className="sr-only">Редактировать</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/sales/${sale.id}`)}
          >
            <Icon name="Eye" className="h-4 w-4" />
            <span className="sr-only">Просмотреть</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteSale(sale.id)}
          >
            <Icon name="Trash" className="h-4 w-4 text-destructive" />
            <span className="sr-only">Удалить</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Продажи</h2>
        <Button onClick={() => navigate("/sales/new")}>
          <Icon name="Plus" className="mr-2 h-4 w-4" />
          Добавить продажу
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Статус:</span>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все статусы</SelectItem>
              <SelectItem value="completed">Завершенные</SelectItem>
              <SelectItem value="pending">В процессе</SelectItem>
              <SelectItem value="canceled">Отмененные</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список продаж</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredSales}
            isLoading={isLoading}
            searchColumn="id"
            searchPlaceholder="Поиск по ID..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesPage;
