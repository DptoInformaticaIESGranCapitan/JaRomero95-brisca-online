<?php

namespace WreckThemBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('WreckThemBundle::index.html.twig');
    }
}
