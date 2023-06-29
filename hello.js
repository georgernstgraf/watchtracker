console.log("hello world")
for (let i = 2; i < 30; i++) {
  if (isPrime(i)) console.log(i)
  //if (isFibonacci(i)) console.log("Fibonacci: " + i)
}
// write a function that checks a number if it is prime
function isPrime(a) {
  for (let i = 2; i < a; i++) {
    if (a % i == 0) return false
  }
  return true
}

// hello copilot where are you
