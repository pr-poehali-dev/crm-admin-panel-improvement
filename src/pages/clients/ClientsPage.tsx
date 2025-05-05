
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { clientsApi, Client } from "@/components/api/apiClient";
import Icon from "@/components/ui/icon";
import { toast } from "@/components/ui/use-toast";

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Клиенты</h2>
        <Button onClick={() => navigate("/clients/new")}>
          <Icon name="Plus" className="mr-2 h-4 w-4" />
          Добавить клиента
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Список клиентов</CardTitle>
          <div className="flex items-center space-x-2 pt-2">
            <div className="relative flex-1">
              <Icon name="Search" className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск клиентов..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead>Компания</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.company}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell>{getStatusBadge(client.status)}</TableCell>
                        <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/clients/${client.id}/edit`)}
                            >
                              <Icon name="Pencil" className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/clients/${client.id}`)}
                            >
                              <Icon name="Eye" className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClient(client.id)}
                            >
                              <Icon name="Trash" className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Клиенты не найдены.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsPage;
