
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { clientsApi, Client } from "@/components/api/apiClient";
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

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const response = await clientsApi.getAll();
      if (response.data) {
        setClients(response.data);
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось загрузить клиентов",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ошибка при загрузке клиентов:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить клиентов",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этого клиента?")) {
      try {
        const response = await clientsApi.delete(id);
        if (response.status === 200) {
          setClients(clients.filter(client => client.id !== id));
          toast({
            title: "Успешно",
            description: "Клиент успешно удален",
          });
        } else {
          toast({
            title: "Ошибка",
            description: response.error || "Не удалось удалить клиента",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Ошибка при удалении клиента:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось удалить клиента",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Активный</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Неактивный</Badge>;
      case 'lead':
        return <Badge className="bg-blue-500">Лид</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Фильтрация клиентов по статусу
  const filteredClients = statusFilter 
    ? clients.filter(client => client.status === statusFilter)
    : clients;

  const columns: DataTableColumn<Client>[] = [
    {
      key: "name",
      title: "Имя",
      sortable: true,
      render: (value) => <div className="font-medium">{value}</div>,
    },
    {
      key: "company",
      title: "Компания",
      sortable: true,
    },
    {
      key: "email",
      title: "Email",
      sortable: true,
    },
    {
      key: "phone",
      title: "Телефон",
    },
    {
      key: "status",
      title: "Статус",
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
    {
      key: "createdAt",
      title: "Дата регистрации",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: "actions",
      title: "Действия",
      render: (_, client) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/clients/${client.id}/edit`)}
          >
            <Icon name="Pencil" className="h-4 w-4" />
            <span className="sr-only">Редактировать</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/clients/${client.id}`)}
          >
            <Icon name="Eye" className="h-4 w-4" />
            <span className="sr-only">Просмотреть</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClient(client.id)}
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
        <h2 className="text-3xl font-bold tracking-tight">Клиенты</h2>
        <Button onClick={() => navigate("/clients/new")}>
          <Icon name="Plus" className="mr-2 h-4 w-4" />
          Добавить клиента
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
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="inactive">Неактивные</SelectItem>
              <SelectItem value="lead">Лиды</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список клиентов</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredClients}
            isLoading={isLoading}
            searchColumn="name"
            searchPlaceholder="Поиск по имени..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsPage;
