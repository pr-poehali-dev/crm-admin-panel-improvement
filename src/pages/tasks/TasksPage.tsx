
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tasksApi, Task } from "@/components/api/apiClient";
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

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Фильтрация задач по статусу и приоритету
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const columns: DataTableColumn<Task>[] = [
    {
      key: "title",
      title: "Название",
      sortable: true,
      render: (value) => <div className="font-medium">{value}</div>,
    },
    {
      key: "status",
      title: "Статус",
      sortable: true,
      render: (value, task) => (
        <Select
          value={value}
          onValueChange={(newValue) => handleStatusChange(task.id, newValue as Task['status'])}
        >
          <SelectTrigger className="h-8 w-[180px]">
            <SelectValue>{getStatusBadge(value)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">К выполнению</SelectItem>
            <SelectItem value="in_progress">В процессе</SelectItem>
            <SelectItem value="done">Завершена</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "priority",
      title: "Приоритет",
      sortable: true,
      render: (value) => getPriorityBadge(value),
    },
    {
      key: "dueDate",
      title: "Срок выполнения",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "assignedTo",
      title: "Ответственный",
      sortable: true,
    },
    {
      key: "actions",
      title: "Действия",
      render: (_, task) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/tasks/${task.id}/edit`)}
          >
            <Icon name="Pencil" className="h-4 w-4" />
            <span className="sr-only">Редактировать</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/tasks/${task.id}`)}
          >
            <Icon name="Eye" className="h-4 w-4" />
            <span className="sr-only">Просмотреть</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteTask(task.id)}
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
        <h2 className="text-3xl font-bold tracking-tight">Задачи</h2>
        <Button onClick={() => navigate("/tasks/new")}>
          <Icon name="Plus" className="mr-2 h-4 w-4" />
          Создать задачу
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
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
              <SelectItem value="todo">К выполнению</SelectItem>
              <SelectItem value="in_progress">В процессе</SelectItem>
              <SelectItem value="done">Завершенные</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Приоритет:</span>
          <Select
            value={priorityFilter}
            onValueChange={setPriorityFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Все приоритеты" />
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

      <Card>
        <CardHeader>
          <CardTitle>Список задач</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredTasks}
            isLoading={isLoading}
            searchColumn="title"
            searchPlaceholder="Поиск по названию..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksPage;
