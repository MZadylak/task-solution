import React from 'react';

class Api {
    constructor(link) {
        this.link = link;
    }

    loadTasks() {
        return this._fetch();
    }

    addTask(task) {
        const options = {
            method: 'POST',
            body: JSON.stringify(task),
            headers: {
                "Content-Type": "application/json"
            }
        }

        return this._fetch(options);
    }

    updateTask(task, path) {
        const options = {
            method: 'PUT',
            body: JSON.stringify(task),
            headers: {
                "Content-Type": "application/json"
            }
        }

        return this._fetch(options, path);
    }

    _fetch(options, path = '') {
        const request = fetch(`${this.link}/${path}`, options);
        return request
        .then(resp => resp.json())
        .then(data => {
            return data;
        })
        .catch(err => console.error(err));
    }
}

class TasksManager extends React.Component {
    state = {
        tasks: [],
        task: ''
    }

    api = new Api('http://localhost:3006/data')

    onClick = () => {
        const { tasks } = this.state;
        console.log( tasks )
    }

    async componentDidMount() {
        const tasksList = await this.api.loadTasks();
        this.setState({
            tasks: tasksList
        })
        this.sortList();
    }

    setNewText (e) {
        const { value } = e.target;
        this.setState({
            task: value,
        })
    }

    addNewTask (e) {
        e.preventDefault();
        const { task, tasks } = this.state;
        const newItem = {
            name: task,
            time: 0,
            isRunning: false,
            isDone: false,
            isRemoved: false,
        }
        this.api.addTask(newItem);
        this.setState({
            tasks: [...tasks, newItem],
            task: '',
        })
    }

    timeMeasure (task) {
        task.isRunning ? this.stopTimer(task) : this.startTimer(task);
    }

    startTimer (task) {
        this.id = setInterval(() => {
            this.setNewState(task, true);
        }, 200);
    }

    stopTimer (task) {
        clearInterval(this.id);
        this.id = null;
        this.setNewState(task, false);
    }

    setNewState (task, type) {
        this.setState(state => {
            const newTasks = state.tasks.map(t => {
                if(t.id === task.id) {
                    const newTask = {...t, time: t.time + 1, isRunning: type};
                    this.api.updateTask(newTask, newTask.id);
                    return newTask;
                }
                return t;
            });
            return {tasks: newTasks};
        });
    }
    
    closeTask (task) {
        clearInterval(this.id);
        this.id = null;
        this.setState(state => {
            const { tasks } = state;
            const newTasks = tasks.map(t => {
                if(t.id === task.id) {
                    const newTask = {...t, isDone: true}
                    this.api.updateTask(newTask, newTask.id);
                    return newTask;
                }
                return t;
            }) 
            return {tasks: newTasks};
        }, () => {
            this.sortList();
        })
    }

    sortList () {
        const { tasks } = this.state;
        const newTaskList = tasks.sort((a, b) => {
            return a.isDone - b.isDone;
        })
        this.setState({
            tasks: newTaskList,
        })
    } 

    removeTask (task) {
        this.setState(state => {
            const { tasks } = state;
            const newTasks = tasks.filter(t => {
                if(task.id !== t.id) {
                    return t;
                }
                const newTask = {...t, isRemoved: true};
                this.api.updateTask(newTask, newTask.id);
            });
            return {tasks: newTasks};
        })
    }

    renderTimer (props) {
        const { seconds } = props;

        return (
            `${Math.floor(seconds/(60*60)) >= 10 ? Math.floor(seconds/(60*60)) : `0${Math.floor(seconds/(60*60))}`}h
            : ${Math.floor(seconds/60) >= 10 ? Math.floor(seconds/60) : `0${Math.floor(seconds/60)}`}m
            : ${seconds%60 >= 10 ? seconds%60 : `0${seconds%60}`}s`
        )
    }

    renderList = () => {
        const { tasks } = this.state;

        return(
            tasks.map(task => {
                if(!task.isRemoved) {
                const { name, time } = task
                return (
                    <>
                    <header>{ name }, { <this.renderTimer seconds={time}/> } </header>
                    <footer>
                        <button onClick={ () => this.timeMeasure(task) } disabled={ task.isDone ? true : false}>start/stop</button>
                        <button onClick={ () => this.closeTask(task) } disabled={ task.isDone ? true : false}>zakończone</button>
                        <button onClick={ () => this.removeTask(task) } disabled={ task.isDone ? false : true }>usuń</button>
                    </footer>
                    </>
                )}
                return null;
                })
        )
    }

    render() {
        const { task, tasks } = this.state;
        return (
        <>
        <h1 onClick={ this.onClick }>TasksManager</h1>
        <form onSubmit={ e => this.addNewTask(e) }>
            <input 
            name="task"
            onChange={ e => this.setNewText(e)}
            value={ task }
            />
            <input type="submit"/>
        </form>
        <section>
            <this.renderList/>
        </section>
        </>)
    }
}

export default TasksManager;