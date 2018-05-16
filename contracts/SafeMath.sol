pragma solidity 0.4.19;

library SafeMath {

    /**
    * @dev Multiplies two numbers, throws on overflow.
    */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }

    /**
    * @dev Integer division of two numbers, truncating the quotient.
    */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    /**
    * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
    */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    /**
    * @dev Adds two numbers, throws on overflow.
    */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
    
    function pow(int base, uint power) internal pure returns (int){
        
        int _base = base;
        bool positive = base >= 0;
        
        if(!positive){
            _base *= -1;
        }
        
        int res = int(uint(_base)**power); //warning: Possible integer overflow when raising power and casting uint to an int
        
        if(!positive && power%2 != 0){ //if the passed number is negative and the power is not even
            res *= -1;
        }
        
		return res;
    }
    
    function mod(int a, int b) internal pure returns (int){
        int res = a % b;

        return res;
    }
    
    function percent(uint numerator, uint denominator, uint precision) public pure returns(uint quotient) {

        uint _numerator  = mul(numerator,10 ** (precision+1));
        uint _quotient =  div(add((div(_numerator,denominator)),5),10); // with rounding of last digit

        return _quotient;
   }
}