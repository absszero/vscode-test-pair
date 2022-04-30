<?php

namespace App;

use PHPUnit\Framework\TestCase;

class FooTest extends TestCase
{
    public function testAdd()
    {
        $foo = new Foo();
        $result = $foo->add(1, 1);
        $this->assertSame(2, $result);
    }
}
