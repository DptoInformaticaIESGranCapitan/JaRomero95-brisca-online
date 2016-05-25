<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class PageController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function indexAction()
    {
        return $this->render('page/index.html.twig');
    }

    /**
     * @Route("/jugar", name="play")
     */
    public function playAction()
    {
        return $this->render('includes/game.html.twig');
    }
}
