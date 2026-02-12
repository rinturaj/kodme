
export interface DocSection {
    id: string;
    title: string;
    content: string;
    code?: string;
}

export const docs: DocSection[] = [
    {
        id: 'intro',
        title: 'Welcome to Kodme',
        content: `Kodme is a friendly coding language designed to be easy to read and write. 
        Everything works step-by-step, just like you think!`,
        code: `show "Hello, World!"`
    },
    {
        id: 'variables',
        title: 'Variables',
        content: `Variables are like boxes where you can store text or numbers. 
        You can create them just by giving them a name and a value.`,
        code: `name = "Alice"
age = 10
show name
show age`
    },
    {
        id: 'io',
        title: 'Show & Ask',
        content: `Use 'show' to print a message to the screen. 
        Use 'ask' to get input from the user.`,
        code: `name = ask "What is your name?"
show "Hello " + name`
    },
    {
        id: 'math',
        title: 'Math',
        content: `You can do basic math operations like addition (+), subtraction (-), multiplication (*), and division (/).`,
        code: `a = 5
b = 3
sum = a + b
show sum`
    },
    {
        id: 'conditions',
        title: 'Decisions (If)',
        content: `Use 'if' blocks to make decisions based on conditions. 
        You can check if things are equal (==), greater (>), or less (<).`,
        code: `secret = 5
guess = 5

if guess == secret
    show "You win!"

if guess < secret
    show "Too low!"`
    },
    {
        id: 'loops',
        title: 'Loops (Repeat)',
        content: `Use 'repeat' to do something multiple times. 
        You can repeat a specific number of times, or while a condition is true.`,
        code: `repeat 3
    show "Hip hip hooray!"

count = 3
repeat count > 0
    show count
    count = count - 1

show "Blastoff!"`
    }
];
