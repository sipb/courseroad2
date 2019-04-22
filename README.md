# CourseRoad 2.0
> A 4-year academic planner for the MIT community.

CourseRoad is a tool for planning out your classes over your entire time at 
MIT. It makes it easy to explore different majors and minors, view your 
progress towards their requirements, and choose which classes to take when in 
order to maximize your time at MIT. CourseRoad allows you to look more than 
one semester ahead make fully informed choices about the big picture.

> - [Installation](#installation)
> - [Development](#development)
> - [Deployment](#deployment)

## Installation
To install, clone this repository to your computer. Simply run `npm install`
to obtain all of the dependencies for this project.

## Development
`npm run dev` will start up the `webpack` development server. Go to 
<http://localhost:8080> to view the website. Any changes you make to the code
will be updated in the browser automatically.

## Deployment
To push changes to the live site, run `deploy.sh`:
```bash
./deploy.sh [dev/prod] [kerberos]
```
This will deploy the code to the 
[development](https://courseroad.mit.edu/dev/) and
[production](https://courseroad.mit.edu/) sites respectively.