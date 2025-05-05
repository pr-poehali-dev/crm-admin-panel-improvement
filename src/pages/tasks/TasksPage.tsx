
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tasksApi, Task } from "@/components/api/apiClient";
import Icon from "@/components/ui/icon";
import { toast } from "@/components/ui/use-toast";

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await tasksApi.getAll();
      if (response.data) {
        setTasks(response.data);
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось загрузить задачи",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ошибка при загрузке задач:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить задачи",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить эту задачу?")) {
      try {
        const response = await tasksApi.delete(id);
        if (response.status === 200) {
          setTasks(tasks.filter(task => task.id !== id));
          toast({
            title: "Успешно",
            description: "Задача успешно удалена",
          });
        } else {
          toast({
            title: "Ошибка",
            description: response.error || "Не удалось удалить задачу",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Ошибка при удалении задачи:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось удалить задачу",
          variant: "destructive",
        });
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: Task['status']) => {
    try {
      const response = await tasksApi.update(id, { status: newStatus });
      if (response.status === 200) {
        setTasks(tasks.map(task => task.id === id ? { ...task, status: newStatus } : task));
        toast({
          title: "Успешно",
          description: "Статус задачи обновлен",
        });
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось обновить статус задачи",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ошибка при обновлении статуса задачи:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус задачи",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return <Badge variant="outline">К выполнению</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">В процессе</Badge>;
      case 'done':
        return <Badge className="bg-green-500">Завершена</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Низкий</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Средний</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Высокий</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Фильтрация задач по поисковому запросу и фильтрам
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Задачи</h2>
        <Button onClick={() => navigate("/tasks/new")}>
          <Icon name="Plus" className="mr-2 h-4 w-4" />
          Создать задачу
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Список задач</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="relative md:col-span-2">
              <Icon name="Search" className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск задач..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все статусы</SelectItem>
                  <SelectItem value="todo">К выполнению</SelectItem>
                  <SelectItem value="in_progress">В процессе</SelectItem>
                  <SelectItem value="done">Завершена</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Фильтр по приоритету" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все приоритеты</SelectItem>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                </SelectContent>
              </Select>
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
                    <TableHead>Название</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Приоритет</TableHead>
                    <TableHead>Срок выполнения</TableHead>
                    <TableHead>Ответственный</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>
                          <Select 
                            value={task.status} 
                            onValueChange={(value) => handleStatusChange(task.id, value as Task['status'])}
                          >
                            <SelectTrigger className="h-8 w-[180px]">
                              <SelectValue>{getStatusBadge(task.status)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todo">К выполнению</SelectItem>
                              <SelectItem value="in_progress">В процессе</SelectItem>
                              <SelectItem value="done">Завершена</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{task.assignedTo}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/tasks/${task.id}/edit`)}
                            >
                              <Icon name="Pencil" className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/tasks/${task.id}`)}
                            >
                              <Icon name="Eye" className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Icon name="Trash" className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Задачи не найдены.
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

export default TasksPage;
