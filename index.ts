import Database from "better-sqlite3";
import cors from 'cors'
import express from 'express'

const app = express()
app.use(cors())
app.use(express.json())


const db = new Database('./data.db', {
    verbose: console.log
})

// : applicants, interviews, interviewers

const interviewers = [
    { name: 'Rinor', email: 'email@email.com' },
    { name: 'Elidon', email: 'email@email.com' },
    { name: 'Visard', email: 'email@email.com' },
    { name: 'Desintila', email: 'email@email.com' },
    { name: 'Artiola', email: 'email@email.com' }
]

const applicants = [
    { name: 'Endi', email: 'email@email.com' },
    { name: 'Geri', email: 'email@email.com' },
    { name: 'Ed', email: 'email@email.com' },
    { name: 'nicolas', email: 'email@email.com' },
    { name: 'grigori', email: 'email@email.com' },
    { name: 'test', email: 'email@email.com' }

]


const interviews = [
    {
        applicantId: 1,
        interviewerId: 1,
        data: 'some text',
        score: 20
    },
    {
        applicantId: 1,
        interviewerId: 2,
        data: 'some text',
        score: 30
    },
    {
        applicantId: 1,
        interviewerId: 3,
        data: 'some text',
        score: 40
    },
    {
        applicantId: 1,
        interviewerId: 4,
        data: 'some text',
        score: 100
    },
    {
        applicantId: 1,
        interviewerId: 5,
        data: 'some text',
        score: 12
    },
    {
        applicantId: 2,
        interviewerId: 1,
        data: 'some text',
        score: 40
    },
    {
        applicantId: 1,
        interviewerId: 3,
        data: 'some text',
        score: 70
    },
    {
        applicantId: 1,
        interviewerId: 5,
        data: 'some text',
        score: 100
    },
    {
        applicantId: 5,
        interviewerId: 1,
        data: 'some text',
        score: 50
    },
    {
        applicantId: 4,
        interviewerId: 3,
        data: 'some text',
        score: 80
    }
]


db.exec(` 

DROP TABLE IF EXISTS  interviews;
DROP TABLE IF EXISTS  applicants;
DROP TABLE IF EXISTS  interviewers;

CREATE TABLE IF NOT EXISTS interviewers (
    id INTEGER ,
    name TEXT NOT NULL, 
    email TEXT NOT NULL, 
PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS applicants (
    id INTEGER ,
    name TEXT NOT NULL, 
    email TEXT NOT NULL, 
PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS interviews(
    id INTEGER, 
    applicantId INTEGER NOT NULL, 
    interviewerId INTEGER NOT NULL,
    data TEXT NOT NULL, 
    score INTEGER NOT NULL, 
    PRIMARY KEY (id) , 
    FOREIGN  KEY (applicantId) REFERENCES  applicants(id),
    FOREIGN  KEY (interviewerId) REFERENCES  interviewers(id)
);

    `)

const createApplicants = db.prepare(`
INSERT INTO applicants (name, email) VALUES (?, ?);
`)

const createInterviewers = db.prepare(`
INSERT INTO interviewers (name, email) VALUES (?, ?);
`)

const createInterviews = db.prepare(`
INSERT INTO interviews (applicantId,  interviewerId, data, score ) VALUES (?, ?, ? ,?);
`)


for (const applicant of applicants) {
    createApplicants.run(applicant.name, applicant.email)
}


for (const interviewer of interviewers) {
    createInterviewers.run(interviewer.name, interviewer.email)
}

for (const interview of interviews) {
    createInterviews.run(interview.applicantId, interview.interviewerId, interview.data, interview.score)
}


const getAllApplications = db.prepare(`
SELECT * FROM applicants;
`)
const getAllinterviewers = db.prepare(`
SELECT * FROM interviewers;
`)
const getAllInterviews = db.prepare(`
SELECT * FROM interviews;
`)


const getApplicationById = db.prepare(`
SELECT * FROM applicants WHERE id =?;
`)
const getIntervierById = db.prepare(`
SELECT * FROM interviewers WHERE id =?;
`)
const getInterviewById = db.prepare(`
SELECT * FROM interviews WHERE id =?;
`)


const getInterviewersForApplicants = db.prepare(`
SELECT DISTINCT interviewers.* FROM interviewers
JOIN interviews ON interviewers.id = interviews.interviewerId
WHERE interviews.applicantId = ?;
`)

const getApplicantsForInterviwers = db.prepare(`
SELECT DISTINCT applicants.* FROM applicants
JOIN interviews ON applicants.id = interviews.applicantId
WHERE interviews.interviewerId = ?;
`)

app.get('/interviews', (req, res) => {
    const interviews = getAllInterviews.all()
    res.send(interviews)
})
app.get('/interviews/:id', (req, res) => {
    const id = req.params.id

    const interview = getInterviewById.get(id)
    res.send(interview)

})

app.get('/interviewers', (req, res) => {
    const interviewers = getAllinterviewers.all()

    for (const interviewer of interviewers) {
        const applicants = getApplicantsForInterviwers.all(interviewer.id)
        interviewer.applicants = applicants
    }
    res.send(interviewers)

})
app.get('/interviewers/:id', (req, res) => {
    const id = req.params.id

    const interviewer = getIntervierById.get(id)
    res.send(interviewer)
})

app.get('/applicants', (req, res) => {
    const applicants = getAllApplications.all()

    for (const applicant of applicants) {
        const interviewers = getInterviewersForApplicants.all(applicant.id)
        applicant.interviewers = interviewers
    }
    res.send(applicants)
})

app.get('/applicants/:id', (req, res) => {
    const id = req.params.id

    const applicant = getApplicationById.get(id)
    res.send(applicant)
})


app.post('/interviews', (req, res) => { })
app.post('/interviewers', (req, res) => { })
app.post('/applicants', (req, res) => { })


app.listen(4000, () => console.log(`server is up and running on:  http://localhost:4000`))