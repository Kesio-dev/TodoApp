import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Datastore from 'nedb'
import { randomUUID } from 'node:crypto'

let db = new Datastore({ filename: './db.db', autoload: true })

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 900,
    minHeight: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon, minHeight: 900, minWidth: 670 } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('projects', (event) => {
    db.find({}, (err, data) => {
      if (err) {
        console.error('Ошибка при получении проектов:', err)
        event.reply('projects-response', { success: false, error: err })
      } else {
        event.reply('projects-response', {
          success: true,
          projects: data
        })
      }
    })
  })

  ipcMain.on('delete-project', (event, projectId) => {
    db.remove({ _id: projectId }, {}, (err, numRemoved) => {
      if (err) {
        console.error('Ошибка при удалении проекта:', err)
        event.reply('delete-project-response', { success: false, error: err })
      } else {
        console.log('Проект успешно удален:', numRemoved)
        event.reply('delete-project-response', { success: true })
      }
    })
  })

  ipcMain.on('update-task-in-project', (event, args) => {
    const { projectId, taskId, updatedTask } = args;

    db.findOne({ "_id": projectId }, (err, doc) => {
      if (err) {
        console.error('Ошибка при поиске проекта:', err);
        event.reply('update-task-in-project-response', { success: false, error: err });
        return;
      }

      if (!doc) {
        console.error('Проект не найден');
        event.reply('update-task-in-project-response', { success: false, error: 'Проект не найден' });
        return;
      }

      // Находим задание по его ID
      const taskToUpdate = doc.tasks.find(t => t._id === taskId);
      if (!taskToUpdate) {
        console.error('Задание не найдено');
        event.reply('update-task-in-project-response', { success: false, error: 'Задание не найдено' });
        return;
      }

      // Обновляем поля задания
      Object.assign(taskToUpdate, updatedTask);

      // Обновляем документ в базе данных
      db.update({ "_id": projectId }, doc, {}, (err, numUpdated) => {
        if (err) {
          console.error('Ошибка при обновлении проекта:', err);
          event.reply('update-task-in-project-response', { success: false, error: err });
        } else {
          console.log('Задание в проекте успешно обновлено:', numUpdated);
          event.reply('update-task-in-project-response', { success: true });
        }
      });
    });
  });


  ipcMain.on('update-project-details', (event, args) => {
    const { projectId, name, img } = args

    db.findOne({ _id: projectId }, (err, doc) => {
      if (err) {
        console.error('Ошибка при поиске проекта:', err)
        event.reply('update-project-details-response', { success: false, error: err })
        return
      }

      if (!doc) {
        console.error('Проект не найден')
        event.reply('update-project-details-response', {
          success: false,
          error: 'Проект не найден'
        })
        return
      }

      // Обновляем поля name и img
      doc.name = name
      doc.img = img

      // Обновляем документ в базе данных
      db.update({ _id: projectId }, doc, {}, (err, numUpdated) => {
        if (err) {
          console.error('Ошибка при обновлении проекта:', err)
          event.reply('update-project-details-response', { success: false, error: err })
        } else {
          console.log('Детали проекта успешно обновлены:', numUpdated)
          event.reply('update-project-details-response', { success: true })
        }
      })
    })
  })

  ipcMain.on('one-project', (event, args) => {
    db.findOne({ _id: args._id }, (err, data) => {
      if (err) {
        console.error('Ошибка при получении проектов:', err)
        event.reply('one-project-response', { success: false, error: err })
      } else {
        event.reply('one-project-response', {
          success: true,
          projects: data
        })
      }
    })
  })

  ipcMain.on('new-project', (event, arg) => {
    const { name } = arg
    db.insert({
      name,
      img: randomImg(),
      tasks: []
    })
  })

  // ipcMain.on('add-task-to-project', (event, arg) => {
  //   const { _id, task } = arg;
  //   console.log(_id)
  //   console.log(task)
  //   db.update({ _id }, { $push: { tasks: task } }, {}, (err, numReplaced) => {
  //     if (err) {
  //       console.error('Ошибка при добавлении задачи:', err);
  //       event.reply('task-added-response', { success: false, error: err });
  //     } else {
  //       console.log('Задача успешно добавлена к проекту:', numReplaced);
  //       event.reply('task-added-response', { success: true });
  //     }
  //   });
  // });
  ipcMain.on('add-task-to-project', (event, arg) => {
    const { _id, task } = arg

    db.findOne({ _id }, (err, doc) => {
      if (err) {
        console.error('Ошибка при поиске проекта:', err)
        event.reply('task-added-response', { success: false, error: err })
        return
      }

      if (!doc) {
        console.error('Проект не найден')
        event.reply('task-added-response', { success: false, error: 'Проект не найден' })
        return
      }

      // Проверяем, существует ли уже задача с таким же _id
      const existingTaskIndex = doc.tasks.findIndex((t) => t._id === task._id)
      if (existingTaskIndex !== -1) {
        // Если задача существует, обновляем ее
        doc.tasks[existingTaskIndex] = task
      } else {
        // Если задачи с таким _id нет, добавляем новую задачу
        doc.tasks.push(task)
      }

      // Обновляем документ в базе данных
      db.update({ _id }, doc, {}, (err, numUpdated) => {
        if (err) {
          console.error('Ошибка при обновлении проекта:', err)
          event.reply('task-added-response', { success: false, error: err })
        } else {
          console.log('Задача успешно добавлена к проекту:', numUpdated)
          event.reply('task-added-response', { success: true })
        }
      })
    })
  })

  ipcMain.on('delete-task-from-project', (event, args) => {
    const { projectId, taskId } = args

    db.findOne({ _id: projectId }, (err, doc) => {
      if (err) {
        console.error('Ошибка при поиске проекта:', err)
        event.reply('task-delete-response', { success: false, error: err })
        return
      }

      if (!doc) {
        console.error('Проект не найден')
        event.reply('task-delete-response', { success: false, error: 'Проект не найден' })
        return
      }

      // Находим индекс задачи для удаления
      const taskIndex = doc.tasks.findIndex((t) => t._id === taskId)
      if (taskIndex === -1) {
        console.error('Задача не найдена')
        event.reply('task-delete-response', { success: false, error: 'Задача не найдена' })
        return
      }

      // Удаляем задачу из массива задач проекта
      doc.tasks.splice(taskIndex, 1)

      // Обновляем документ в базе данных без удаленной задачи
      db.update({ _id: projectId }, doc, {}, (err, numUpdated) => {
        if (err) {
          console.error('Ошибка при обновлении проекта:', err)
          event.reply('task-delete-response', { success: false, error: err })
        } else {
          console.log('Задача успешно удалена из проекта:', numUpdated)
          event.reply('task-delete-response', { success: true })
        }
      })
    })
  })

  ipcMain.on('task:complete', (event, args) => {
    db.findOne({ _id: args.projectId }, (err, doc) => {
      if (err) {
        console.error('Error finding project:', err)
        event.reply('task:complete:error', err)
        return
      }

      // Проверяем, нашёлся ли документ
      if (!doc) {
        console.error('Project not found')
        event.reply('task:complete:error', 'Project not found')
        return
      }

      // Находим и обновляем нужное задание
      const task = doc.tasks.find((t) => t._id === args.taskId)
      if (task) {
        task.done = true // Обновляем поле done
      } else {
        console.error('Task not found')
        event.reply('task:complete:error', 'Task not found')
        return
      }

      // Сохраняем обновлённый документ обратно в базу данных
      db.update({ _id: args.projectId }, doc, {}, (err, numUpdated) => {
        if (err) {
          console.error('Error updating project:', err)
          event.reply('task:complete:error', err)
        } else {
          console.log('Task updated successfully')
          event.reply('task:complete:success')
        }
      })
    })
  })

  ipcMain.on('task:uncomplete', (event, args) => {
    db.findOne({ _id: args.projectId }, (err, doc) => {
      if (err) {
        console.error('Error finding project:', err)
        event.reply('task:complete:error', err)
        return
      }

      // Проверяем, нашёлся ли документ
      if (!doc) {
        console.error('Project not found')
        event.reply('task:complete:error', 'Project not found')
        return
      }

      // Находим и обновляем нужное задание
      const task = doc.tasks.find((t) => t._id === args.taskId)
      if (task) {
        task.done = false // Обновляем поле done
      } else {
        console.error('Task not found')
        event.reply('task:complete:error', 'Task not found')
        return
      }

      // Сохраняем обновлённый документ обратно в базу данных
      db.update({ _id: args.projectId }, doc, {}, (err, numUpdated) => {
        if (err) {
          console.error('Error updating project:', err)
          event.reply('task:complete:error', err)
        } else {
          console.log('Task updated successfully')
          event.reply('task:complete:success')
        }
      })
    })
  })

  // ipcMain.on('new-task', (event, arg) => {
  //   db.insert({
  //     id: arg.id,
  //     name: arg.name,
  //     img: "coconut",
  //     tasks: [],
  //   });
  // });

  ipcMain.on('get', (event, arg) => {
    db.find({ year: 1946 }, function (err, docs) {
      console.log(docs)
    })
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

function randomImg() {
  const textArray = [
    'clipboard',
    'coconut',
    'baseball',
    'football',
    'pizza',
    'printer',
    'shopcart',
    'snowman',
    'warning'
  ]
  const randomIndex = Math.floor(Math.random() * textArray.length)
  const result = textArray[randomIndex]
  console.log(result)
  return result
}
