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
        const aaaa = await this.api.loadTasks();
        this.setState({
            tasks: aaaa
        })
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
        this.id = setInterval(() => {
            console.log('aaa');
            this.setState(state => {
                const { tasks } = state;
                const newTasks = tasks.map(t => {
                    if(t === task) {
                        const newTask = {...task, time: task.time + 1, isRunning: true};
                        console.log(newTask);
                        this.api.updateTask(newTask, task.id);
                        return newTask;
                    }
                    return t;
                });
                return {tasks: newTasks};
            })
        }, 1000);
    }

    startTimer (task) {
        
    }

    stopTimer (task) {
    }

    renderList = () => {
        const { tasks } = this.state;

        return(
            tasks.map(task => {
            const { name, time } = task
            return (
                <>
                <header>{ name }, { time } </header>
                <footer>
                    <button onClick={ () => this.timeMeasure(task) }>start/stop</button>
                    <button>zakończone</button>
                    <button disabled={ true }>usuń</button>
                </footer>
                </>
            )
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